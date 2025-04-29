use std::{fs::File, io::{self, BufRead}, path::Path};
use tauri::regex::Regex;
use ffmpeg_next as ffmpeg;
use anyhow::Result;

use crate::modles::{db_song::Song, music_lyrics::Lyric};
use encoding_rs::{UTF_8, GBK, SHIFT_JIS, GB18030};

// 判断是否像是可读文本（中文或英文）
fn is_meaningful(s: &str) -> bool {
    let clean = s.trim();

    // 要求至少长度为 2，不能全是控制字符或奇怪符号
    if clean.is_empty() || clean.chars().count() < 2 {
        return false;
    }

    // 中文（常用区）或 英文字母
    let has_chinese = clean.chars().any(|c| ('\u{4E00}'..='\u{9FFF}').contains(&c));
    let alpha_count = clean.chars().filter(|c| c.is_ascii_alphabetic()).count();

    has_chinese || alpha_count > 3
}

fn ret_org(bytes: &[u8]) -> Vec<u8>{
   // 第一步：把这串 UTF-8 字节转成 Rust 字符串（乱码）
   let wrong_str = String::from_utf8_lossy(&bytes);
   println!("误解码后的乱码字符串: {}", wrong_str);

   // 第二步：将这个字符串按照 Latin-1（每个 char -> byte）取出原始字节
   let raw_bytes: Vec<u8> = wrong_str.chars().map(|c| c as u8).collect();
   println!("还原出的原始 GBK 字节: {:?}", raw_bytes);

   return raw_bytes;
}

fn try_decode(bytes: &[u8]) -> String {
    // let bytes = ret_org(b);
    let encoding = [
        ("UTF_8", UTF_8),
        ("GBK", GBK),
        ("SHIFT_JIS", SHIFT_JIS),
        ("GB18030", GB18030),
    ];

    for (t, e) in encoding{
        // 遍历编码列表，依次尝试解码
        let s = e.decode(&bytes).0;
        let s1 = e.decode(&bytes).1;
        let s2 = e.decode(&bytes).2;
        println!("信息s0 {t}: {:?}", s);
        println!("信息s1 {t}: {:?}", s1);
        println!("信息s2 {t}: {}", s2);

        if String::from_utf8_lossy(s.as_bytes()).to_string().contains('�'){
            println!("无效的UTF-8编码，from_utf8_lossy: {}", s);
        }else if !is_meaningful(&s) {
            println!("无效的UTF-8编码，is_meaningful: {}", s);
            let b = ret_org(bytes);
            return try_decode(&b);
        } else {
            match std::str::from_utf8(s.as_bytes()) {
                Ok(str) => {
                    println!("编码ok: {}", s);
                    return str.to_string();
                }
                Err(e) => {
                    println!("错误信息: {}", e);
                }
            }
        }

    }

    return "Unknown".to_string();
}

pub fn get_audio_metadata(path_str: &str) -> Result<Song> {

    let ictx = ffmpeg::format::input(path_str)?;
    // 获取格式上下文中的 metadata
    let metadata = ictx.metadata();

    let mut title = try_decode(metadata.get("title").unwrap_or("Unknown").as_bytes());
    let artist = try_decode(metadata.get("artist").unwrap_or("Unknown").as_bytes());

    let path = Path::new(path_str);
    if title == "Unknown".to_string(){
        title = path.file_name().map(|name| name.to_string_lossy().into_owned()).unwrap_or("Unknown".to_string());
    }

    let duration_us = ictx.duration(); // 单位是微秒（i64）
    let duration = duration_us as u64 / 1_000_000; // 转成秒

    println!("title:{title}");
    println!("artist:{artist}");
    println!("音频总时长: {:.2} 秒", duration);
    Ok(Song{
        id: None,
        title: title,
        author: Some(artist),
        is_collect: false,
        is_follow: false,
        lyrics: vec![],
        lyrics_path: None,
        audio_src: path.to_path_buf(),
        total_duration: duration,
        bar_current_progress_sec: 0,
        is_playing: false,
    })
}

pub fn get_audio_lyrics(lyrics_file: &str) -> Result<Vec<Lyric>>{
    let path = Path::new(lyrics_file);
    let file = File::open(path)?;
    let reader = io::BufReader::new(file);

    let mut lyrics = Vec::new();
    let mut metadata = Vec::new();  // 用于存储元数据

    let timestamp_re = Regex::new(r"\[(\d{2}):(\d{2})\.(\d{3})\]")?;
    let metadata_re = Regex::new(r"\[(\w+):(.+)\]")?;  // 匹配元数据格式 [key:value]

    let mut is_metadata = true;
    for line in reader.lines() {
        let line = line?;

        // 如果是时间戳和歌词，解析并存储
        if let Some(captures) = timestamp_re.captures(&line) {
            let minutes: u64 = captures[1].parse()?;
            let seconds: u64 = captures[2].parse()?;
            // let milseconds: f64 = captures[3].parse()?;
            let text = timestamp_re.replace_all(&line, "").to_string();
            // let text = captures[4].to_string();

            // 将时间戳转换为秒
            lyrics.push(Lyric {
                time: (minutes * 60 + seconds) as f64,
                text,
            });
            is_metadata = false;
        } else if let Some(captures) = metadata_re.captures(&line){
            if is_metadata {
                // 如果是元数据，提取并存储
                let key = &captures[1];
                let value = &captures[2];
                metadata.push((key.to_string(), value.to_string()));
            }

        }
    }

    // metadata暂时不返回，后面再说
    Ok(lyrics)

}