use std::{fs::File, io::{self, BufRead}, path::Path};
use tauri::regex::Regex;
use ffmpeg_next as ffmpeg;

use crate::modles::{db_song::Song, music_lyrics::Lyric};


pub fn get_audio_metadata(path_str: &str) -> Song {

    let ictx = ffmpeg::format::input(path_str).unwrap();
    let duration_us = ictx.duration(); // 单位是微秒（i64）
    let duration = duration_us as u64 / 1_000_000; // 转成秒

    let path = Path::new(path_str);
    // 使用 file_name 方法提取文件名
    let title = path.file_name().map(|name| name.to_string_lossy().into_owned()).unwrap_or("Unknown".to_string());

    println!("title:{title}");
    println!("音频总时长: {:.2} 秒", duration);
    return Song{
        id: None,
        title: title,
        author: None,
        is_collect: false,
        is_follow: false,
        lyrics: vec![],
        lyrics_path: None,
        audio_src: path.to_path_buf(),
        total_duration: duration,
        bar_current_progress_sec: 0,
        is_playing: false,
    };
}

pub fn get_audio_lyrics(lyrics_file: &str) -> io::Result<Vec<Lyric>>{
    let path = Path::new(lyrics_file);
    let file = File::open(path).unwrap();
    let reader = io::BufReader::new(file);

    let mut lyrics = Vec::new();
    let mut metadata = Vec::new();  // 用于存储元数据

    let timestamp_re = Regex::new(r"\[(\d{2}):(\d{2})\.(\d{3})\]").unwrap();
    let metadata_re = Regex::new(r"\[(\w+):(.+)\]").unwrap();  // 匹配元数据格式 [key:value]

    let mut is_metadata = true;
    for line in reader.lines() {
        let line = line.unwrap();

        // 如果是时间戳和歌词，解析并存储
        if let Some(captures) = timestamp_re.captures(&line) {
            let minutes: u64 = captures[1].parse().unwrap();
            let seconds: u64 = captures[2].parse().unwrap();
            // let milseconds: f64 = captures[3].parse().unwrap();
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