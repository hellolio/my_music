// src-tauri/src/models.rs
use serde::{Deserialize, Serialize};


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Playlists {
    pub id: Option<i64>,  // INSERT 时传 None 自动生成
    pub name: String,
}
