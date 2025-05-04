// src-tauri/src/models.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SongsForLyrics {
    pub id: i64,
    pub mid: String,
    pub title: String,
    pub subtitle: String,
    pub artist: Vec<String>,
    pub album: String,
    pub duration: u32,
}