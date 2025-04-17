// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, sync::{Arc, Mutex}};
use tauri::{State, Window};
use rusqlite::Connection;


use controllers::audio_player::AudioPlayer;
use modles::{db_song::Song, music_lyrics::Lyric};

mod modles;
mod controllers;
mod common;
mod db;

pub struct AppState {
    pub db: Mutex<Connection>,      // 数据库连接（线程安全）
    pub player: Arc<Mutex<AudioPlayer>>,   // 应用配置
}


#[tauri::command]
fn add_lyrics(state: State<'_, Arc<AppState>>, lyrics_file: &str, id: i64) -> Vec<Lyric> {
    let mut conn = state.db.lock().unwrap();
    let lyrics = common::utils::get_audio_lyrics(lyrics_file).unwrap();
    let _ = db::db::update_lyrics(&mut *conn, lyrics_file, id);
    lyrics
}

#[tauri::command]
fn delete_music_from_db(state: State<'_, Arc<AppState>>, songs: Vec<Song>){
    let mut conn = state.db.lock().unwrap();
    for song in songs {
        db::db::delete_song(&mut *conn, song.id.unwrap());
    }
}

#[tauri::command]
fn import_music_to_db(state: State<'_, Arc<AppState>>, file_names: Vec<&str>) -> Vec<Song>{
    let mut conn = state.db.lock().unwrap();
    let mut song_metas = vec![];
    for file in file_names {
        println!("前端过来的值是：{file}");
        // 先查询是否数据库已经存在
        let song_meta = db::db::get_song_by_path(&*conn, file.to_string());
        match song_meta {
            Ok(song) => {
                println!("歌曲已经存在了:{:?}", song);
            }
            _ => {
                let mut song = common::utils::get_audio_metadata(file);

                let id = db::db::insert_song(&mut *conn, &song);
                    song.id = Some(id);
                    song_metas.push(song);
                    println!("id:{id}");
            }
        }
    }
    println!("插入到数据库的歌曲：{:?}", song_metas);
    return song_metas;
}


#[tauri::command]
fn play_music(state: State<'_, Arc<AppState>>, window: Window, file_path: &str, duration: u64, skip_secs: u64, volume: f32) -> Song {
    
    let mut p = state.player.lock().unwrap();
    p.music_play(window, file_path.to_string(), duration, skip_secs, volume);

    let conn = state.db.lock().unwrap();
    let mut song_meta = db::db::get_song_by_path(&*conn, file_path.to_string()).unwrap();
    let mut lyrics = vec![];
    match song_meta.lyrics_path.clone() {
        Some(path) => {
           lyrics = common::utils::get_audio_lyrics(path.to_str().unwrap()).unwrap();
        }
        None=> {}
    }
    song_meta.lyrics = lyrics;
    return song_meta;
}


#[tauri::command]
fn pause_music(state: State<'_, Arc<AppState>>) {
    let p = state.player.lock().unwrap();
    p.music_pause();
}

#[tauri::command]
fn control_volume(state: State<'_, Arc<AppState>>, volume: f32) {
    let p = state.player.lock().unwrap();
    p.music_volume(volume);
}

#[tauri::command]
fn resume_music(state: State<'_, Arc<AppState>>) {
    let p = state.player.lock().unwrap();
    p.music_resume();
}

#[tauri::command]
fn stop_music(state: State<'_, Arc<AppState>>) {
    let p = state.player.lock().unwrap();
    p.music_stop();
}

#[tauri::command]
fn seek_music(state: State<'_, Arc<AppState>>, skip_secs: u64) {
    let p = state.player.lock().unwrap();
    p.music_seek(skip_secs);
}

#[tauri::command]
fn get_song_all(state: State<'_, Arc<AppState>>) -> Vec<Song> {
    let conn = state.db.lock().unwrap();
    let songs_result = db::db::get_song_all(&*conn);

    match songs_result {
        Ok(mut songs) => {
            for song in songs.iter_mut() {
                let mut lyrics = vec![];
                match song.lyrics_path.clone() {
                    Some(path) => {
                        lyrics = common::utils::get_audio_lyrics(path.to_str().unwrap()).unwrap();
                    }
                    None=> {}
                }
                song.lyrics = lyrics;

            }
            return songs;
        }
        _ => {return vec![];}
    }

}

fn main() {
    add_bin_to_path();
    let state = AppState{
        db: Mutex::new(db::db::init_db().expect("数据库初始化失败")),
        player: Arc::new(Mutex::new(AudioPlayer::new()))
    };
    tauri::Builder::default()
        .manage(Arc::new(state))
        .invoke_handler(tauri::generate_handler![
            play_music,
            pause_music,
            resume_music,
            stop_music,
            seek_music,
            control_volume,
            import_music_to_db,
            delete_music_from_db,
            add_lyrics,
            get_song_all
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn add_bin_to_path() {
    // 获取当前可执行文件的路径
    let exe_path = env::current_exe().unwrap();
    
    // 获取当前目录
    let current_dir = exe_path.parent().unwrap();
    
    // 构造 bin 目录的路径
    let bin_dir = current_dir.join("bin");
    
    // 将 bin 目录路径转换为字符串
    let bin_dir_str = bin_dir.to_string_lossy().to_string();

    // 获取当前的 PATH 环境变量
    let mut path = env::var("PATH").unwrap_or_default();
    
    // 检查 bin 目录是否已在 PATH 中
    if !path.contains(&bin_dir_str) {
        // 如果 bin 目录不在 PATH 中，将其添加到 PATH 环境变量中
        path.push_str(&format!(";{}", bin_dir_str));
        env::set_var("PATH", path);
    }

}