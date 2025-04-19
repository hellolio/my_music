use std::{fs::File, io::{self, BufRead}, path::Path};
use tauri::regex::Regex;
use ffmpeg_next as ffmpeg;
use anyhow::Result;


use crate::modles::{db_song::Song, music_lyrics::Lyric};


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


pub fn get_audio_metadata(path_str: &str) -> Result<Song> {

    let ictx = ffmpeg::format::input(path_str)?;
    // 获取格式上下文中的 metadata
    let metadata = ictx.metadata();
    for (key, value) in metadata.iter() {
        println!("{}: {}", key, value);
    }

    let mut title = metadata.get("title").unwrap_or("").to_string();
    let mut artist = metadata.get("artist").unwrap_or("").to_string();
    // let album = metadata.get("album").unwrap_or("").to_string();

    let path = Path::new(path_str);
    
    if !is_meaningful(&title) {
        title = path.file_name().map(|name| name.to_string_lossy().into_owned()).unwrap_or("Unknown".to_string());
    }
    if !is_meaningful(&artist) {
        artist = "Unknown".to_string();
    }

    let duration_us = ictx.duration(); // 单位是微秒（i64）
    let duration = duration_us as u64 / 1_000_000; // 转成秒

    println!("title:{title}");
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