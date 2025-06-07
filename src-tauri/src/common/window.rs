use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File},
    io::{Read, Write},
    path::{self, PathBuf},
};
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug)]
pub struct WindowState {
    pub selected_remeber_size: bool,
    pub window_x: u32,
    pub window_y: u32,
    pub window_width: u32,
    pub window_height: u32,
}

fn window_state_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let mut path = app_handle
        .path()
        .app_config_dir()
        .expect("Failed to get app config dir");
    path.push("window_state.json");
    // 创建上级目录（如果不存在）
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap(); // 递归创建
    }
    path
}

pub fn save_window_state(app_handle: &tauri::AppHandle, window_state: &WindowState) {
    let path = window_state_path(app_handle);

    let json = serde_json::to_string_pretty(window_state).unwrap();

    let mut file = File::create(path).expect("Could not create file");
    file.write_all(json.as_bytes())
        .expect("Failed to write JSON");
}

pub fn load_window_state(app_handle: &tauri::AppHandle) -> Option<WindowState> {
    let path = window_state_path(app_handle);
    if path.exists() {
        let mut file = File::open(path).ok()?;
        let mut contents = String::new();
        file.read_to_string(&mut contents).ok()?;
        serde_json::from_str(&contents).ok()
    } else {
        None
    }
}
