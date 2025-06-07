// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    env, fs,
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
};

use rusqlite::Connection;
use tauri::{Manager, PhysicalPosition, PhysicalSize, State, Window, WindowEvent};

use common::{
    utils,
    window::{self},
};
use controllers::{audio_player::AudioPlayer, get_lyrics};
use database::db;
use modles::{
    db_song::Song, music_lyrics::Lyric, music_play_list_song::PlaylistSong,
    songs_for_lyrics::SongsForLyrics,
};

mod common;
mod controllers;
mod database;
mod modles;

const PROJECT_ROOT: &str = env!("CARGO_MANIFEST_DIR");

pub struct AppState {
    pub db: Mutex<Connection>,           // 数据库连接（线程安全）
    pub player: Arc<Mutex<AudioPlayer>>, // 应用配置
    is_desktop_mode: Arc<AtomicBool>,    // 是否记住桌面大小和位置
}

#[tauri::command]
fn add_lyrics(state: State<'_, Arc<AppState>>, lyrics_file: &str, id: i64) -> Vec<Lyric> {
    let mut conn = state.db.lock().unwrap();
    let lyrics = utils::get_audio_lyrics_qq(lyrics_file);
    match lyrics {
        Ok(lyrics) => {
            let _ = db::update_lyrics(&mut *conn, lyrics_file, id);
            lyrics
        }
        Err(_) => {
            println!("歌词加载失败");
            vec![]
        }
    }
}

#[tauri::command]
fn delete_music_from_db(state: State<'_, Arc<AppState>>, songs: Vec<Song>) {
    let mut conn = state.db.lock().unwrap();
    for song in songs {
        db::delete_song(&mut *conn, song.id.unwrap());
    }
}

#[tauri::command]
fn import_music_to_db(
    state: State<'_, Arc<AppState>>,
    file_names: Vec<&str>,
    id: i64,
) -> Vec<Song> {
    let mut conn = state.db.lock().unwrap();
    let mut song_metas = vec![];
    for file in file_names {
        println!("前端过来的值是：{file}");
        // 先查询是否数据库已经存在
        let song_meta = db::get_song_by_path(&*conn, file.to_string(), id);
        match song_meta {
            Ok(song) => {
                println!("歌曲已经存在了:{:?}", song);
            }
            _ => {
                if let Ok(mut song) = utils::get_audio_metadata(file) {
                    let mut path_buf = PathBuf::from(file);
                    path_buf.set_extension("lrc");
                    path_buf.to_str().map(|s| s.to_string());
                    println!("{:?}", path_buf);
                    let lyrics = utils::get_audio_lyrics_qq(path_buf.to_str().unwrap());
                    match lyrics {
                        Ok(lyrics_context) => {
                            song.lyrics_path = Some(path_buf);
                            song.lyrics = lyrics_context;
                        }
                        Err(_) => {}
                    }
                    let id = db::insert_song(&mut *conn, &song, id);
                    song.id = Some(id);
                    song_metas.push(song);
                    println!("id:{id}");
                }
            }
        }
    }
    println!("插入到数据库的歌曲：{:?}", song_metas);
    return song_metas;
}

#[tauri::command]
fn create_playlist(state: State<'_, Arc<AppState>>, name: String) -> Result<(), String> {
    let mut conn = state.db.lock().unwrap();
    let _ = db::insert_playlists(&mut *conn, name);
    Ok(())
}

#[tauri::command]
fn delete_playlist(state: State<'_, Arc<AppState>>, playlist_id: i64) -> Result<(), String> {
    let mut conn = state.db.lock().unwrap();
    let _ = db::delete_playlists(&mut *conn, playlist_id);
    Ok(())
}

#[tauri::command]
fn play_music(
    state: State<'_, Arc<AppState>>,
    window: Window,
    id: i64,
    file_path: &str,
    duration: u64,
    skip_secs: u64,
    volume: f32,
) -> Result<Song, ()> {
    let mut p = state.player.lock().unwrap();
    p.music_play(window, file_path.to_string(), duration, skip_secs, volume);

    let conn = state.db.lock().unwrap();
    println!("{}, {}", file_path, id);
    if let Ok(mut song_meta) = db::get_song_by_path(&*conn, file_path.to_string(), id) {
        let mut lyrics = vec![];
        match song_meta.lyrics_path.clone() {
            Some(path) => {
                lyrics =
                    utils::get_audio_lyrics_qq(path.to_str().unwrap_or("")).unwrap_or_default();
            }
            None => {}
        }
        song_meta.lyrics = lyrics;
        Ok(song_meta)
    } else {
        Err(())
    }
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
fn resume_music(state: State<'_, Arc<AppState>>, volume: f32) {
    let p = state.player.lock().unwrap();
    p.music_resume(volume);
}

#[tauri::command]
fn stop_music(state: State<'_, Arc<AppState>>) {
    let p = state.player.lock().unwrap();
    p.music_stop();
}

#[tauri::command]
fn seek_music(state: State<'_, Arc<AppState>>, skip_secs: u64, volume: f32) {
    let p = state.player.lock().unwrap();
    p.music_seek(skip_secs, volume);
}

#[tauri::command]
fn get_song_all(state: State<'_, Arc<AppState>>) -> Vec<PlaylistSong> {
    let conn = state.db.lock().unwrap();
    let playlists = db::get_playlists(&*conn);
    let mut playlist_songs: Vec<PlaylistSong> = vec![];
    match playlists {
        Ok(playlists) => {
            for playlist in &playlists {
                let songs_result =
                    db::get_song_all(&*conn, playlist.id.unwrap_or_default()).unwrap_or_default();
                let playlist_song = PlaylistSong {
                    id: playlist.id.unwrap_or_default(),
                    name: playlist.name.clone(),
                    songs: songs_result,
                };
                playlist_songs.push(playlist_song);
            }
            playlist_songs
        }
        Err(_) => {
            vec![]
        }
    }
}

#[tauri::command]
async fn get_lyrics_targets(keyword: String) -> Vec<SongsForLyrics> {
    let songs = get_lyrics::get_qq_lyrics(keyword)
        .await
        .unwrap_or_else(|e| {
            println!("get_qq_lytics_list is err: {e}");
            vec![]
        });
    return songs;
}

#[tauri::command]
async fn get_lyrics(
    album: &str,
    singer: &str,
    song_name: &str,
    duration: u32,
    id: i64,
    save_path: &str,
) -> Result<Vec<Lyric>, String> {
    let lyrics = get_lyrics::get_qq_lytics_by_id(album, singer, song_name, duration, id)
        .await
        .map_err(|e| e.to_string());
    match lyrics {
        Ok(l) => {
            let _ = fs::write(save_path, &l);
            let show_lyrics = utils::get_audio_lyrics_qq(save_path).unwrap_or_default();
            return Ok(show_lyrics);
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn get_cover_from_music(input_path: &str) -> String {
    utils::get_cover_from_music(input_path).unwrap_or("".to_string())
}

#[tauri::command]
fn set_is_desktop_mode(state: State<'_, Arc<AppState>>, is_desktop_mode: bool) {
    state
        .is_desktop_mode
        .store(is_desktop_mode, Ordering::Relaxed);
}

#[tauri::command]
fn set_always_on_top(window: Window, window_on_top: bool) {
    let _ = window.set_always_on_top(window_on_top);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    add_bin_to_path();
    let state = AppState {
        db: Mutex::new(db::init_db().expect("数据库初始化失败")),
        player: Arc::new(Mutex::new(AudioPlayer::new())),
        is_desktop_mode: Arc::new(AtomicBool::new(false)),
    };
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            if let Some(window_state) = window::load_window_state(&app.app_handle()) {
                if window_state.selected_remeber_size {
                    window
                        .set_position(PhysicalPosition {
                            x: window_state.window_x,
                            y: window_state.window_y,
                        })
                        .ok();
                    window
                        .set_size(PhysicalSize {
                            width: window_state.window_width,
                            height: window_state.window_height,
                        })
                        .ok();
                }
            }
            Ok(())
        })
        .manage(Arc::new(state))
        .on_window_event(|window, event| {
            // let window = window();
            let app_handle = window.app_handle();

            let is_desktop_mode = app_handle
                .state::<Arc<AppState>>()
                .is_desktop_mode
                .load(Ordering::Relaxed);
            if !is_desktop_mode {
                match event {
                    WindowEvent::Resized(_) | WindowEvent::Moved(_) => {
                        let position = window.outer_position().unwrap_or_default();
                        let size = window.outer_size().unwrap_or_default();
                        let mut selected_remeber_size = true;
                        if let Some(window_state_old) =
                            window::load_window_state(&window.app_handle().app_handle())
                        {
                            selected_remeber_size = window_state_old.selected_remeber_size;
                        };
                        let window_state = window::WindowState {
                            selected_remeber_size,
                            window_x: if position.x < 100 {
                                0
                            } else {
                                position.x as u32
                            },
                            window_y: if position.y < 100 {
                                0
                            } else {
                                position.y as u32
                            },
                            window_width: if size.width < 200 { 200 } else { size.width },
                            window_height: if size.height < 400 { 200 } else { size.height },
                        };
                        window::save_window_state(&window.app_handle(), &window_state);
                    }
                    _ => {}
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            play_music,
            pause_music,
            resume_music,
            stop_music,
            seek_music,
            control_volume,
            create_playlist,
            delete_playlist,
            import_music_to_db,
            delete_music_from_db,
            add_lyrics,
            get_song_all,
            get_lyrics_targets,
            get_lyrics,
            get_cover_from_music,
            set_is_desktop_mode,
            set_always_on_top,
        ])
        // .plugin(tauri_plugin_window::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn add_bin_to_path() {
    // let current_path = env::current_dir().unwrap();
    println!("PROJECT_ROOT is: {PROJECT_ROOT}");
    std::env::set_var("MY_DLL_PATH", format!("{PROJECT_ROOT}/bin/"));

    // 获取当前可执行文件目录（bin 目录）
    let exe_path = env::current_exe().unwrap();
    let exe_dir = exe_path.parent().unwrap();

    // 构造新的 PATH，加入 bin 路径
    let current_path = env::var("PATH").unwrap_or_default();
    let new_path = format!("{};{}", exe_dir.display(), current_path);
    env::set_var("PATH", &new_path);

    dotenvy::dotenv().ok();
}
