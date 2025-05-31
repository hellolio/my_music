// src-tauri/src/models.rs
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use super::music_lyrics::Lyric;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Song {
    pub id: Option<i64>, // INSERT 时传 None 自动生成
    pub title: String,
    pub author: Option<String>,
    pub is_collect: bool,
    pub is_follow: bool,
    pub lyrics: Vec<Lyric>,
    pub lyrics_path: Option<PathBuf>,
    pub audio_src: PathBuf,
    pub total_duration: u64,
    pub bar_current_progress_sec: u64,
    pub is_playing: bool,
}
