use std::{fs::File, io::{self, BufRead, BufReader}, path::Path};
use hound::WavReader;
use mp3_duration;
use tauri::regex::Regex;
use claxon::FlacReader;


use crate::modles::{db_song::Song, music_lyrics::Lyric};


pub fn get_audio_metadata(path_str: &str) -> Song {

    let path = Path::new(path_str);
    let mut duration: u64 = 0;
    match path.extension() {
        Some(ext) => {
            match ext.to_str() {
                Some("mp3") => {duration = mp3_duration::from_path(path_str).unwrap().as_secs()},
                Some("flac") => {
                    // 打开 FLAC 文件
                    let file = File::open(path_str).unwrap();
                    let reader = BufReader::new(file);
                    // 创建 FLAC 读取器
                    let flac_reader = FlacReader::new(reader).unwrap();
                    // 获取音频流信息（采样率、通道数等）
                    let stream_info = flac_reader.streaminfo();
                    // 获取总样本数
                    let total_samples = stream_info.samples.unwrap();
                    // 计算时长（秒）
                    duration = (total_samples as f64 / stream_info.sample_rate as f64) as u64;

                },
                Some("wav") => {
                        // 打开 WAV 文件
                        let mut reader = WavReader::open(path).expect("无法打开 WAV 文件");
                        // 获取 WAV 文件的基本信息
                        let spec = reader.spec();
                        let num_samples = reader.samples::<i16>().count(); // 获取样本总数
                        let sample_rate = spec.sample_rate; // 获取采样率
                        let num_channels = spec.channels;
                        // 计算音频时长
                        duration = num_samples as u64 / (sample_rate as u64 * num_channels as u64);
                }
                _ => {duration = 999},
            }
        }
        None => {},
    };


    let path = Path::new(path_str);
    // 使用 file_name 方法提取文件名
    let title = path.file_name().map(|name| name.to_string_lossy().into_owned()).unwrap_or("Unknown".to_string());

    println!("title:{title}");
    println!("duration:{:?}",duration);
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