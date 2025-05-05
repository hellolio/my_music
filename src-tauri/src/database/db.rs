use std::path::PathBuf;

use rusqlite::{Connection, Result};

use crate::modles::{db_playlists::Playlists, db_song::Song};

pub fn init_db() -> Result<Connection> {
    // 打开或创建数据库文件（自动处理）
    let conn = Connection::open("app.db")?;
    
    // 智能建表（仅当表不存在时执行）
    conn.execute(
        "
            CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playlist_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                author TEXT,
                is_collect BOOLEAN NOT NULL DEFAULT FALSE,
                is_follow BOOLEAN NOT NULL DEFAULT FALSE,
                lyrics_path TEXT,
                audio_src TEXT NOT NULL,  -- 音频文件路径需唯一且非空
                total_duration INTEGER NOT NULL,  -- 单位：秒
                bar_current_progress_sec INTEGER NOT NULL DEFAULT 0,
                is_playing BOOLEAN NOT NULL DEFAULT FALSE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ",
        [], // 无参数
    )?;
    conn.execute(
        "
            CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ",
        [], // 无参数
    )?;
    conn.execute(
        "
            INSERT INTO playlists (name)
            SELECT '歌单1'
            WHERE NOT EXISTS (SELECT 1 FROM playlists);
        ",
        [], // 无参数
    )?;

    Ok(conn)
}

pub fn insert_playlists(conn: &mut Connection, playlist_name: String) -> i64 {
    let result = conn.execute(
        "
            INSERT INTO playlists (name) VALUES (?1)
        ",
        rusqlite::params![playlist_name],
    );
    match result {
        Ok(_) => {conn.last_insert_rowid()}
        Err(_) => {-1}
    }
}

pub fn delete_playlists(conn: &mut Connection, id: i64) -> i64 {
    let result = conn.execute(
        "
            delete from playlists where id = ?1
        ",
        rusqlite::params![id.to_string()],
    );
    match result {
        Ok(_) => {conn.last_insert_rowid()}
        Err(_) => {-1}
    }
}

pub fn insert_song(conn: &mut Connection, song: &Song, id: i64) -> i64 {
    println!("歌单id：{}", id.to_string());
    let result = conn.execute(
        "
            INSERT INTO songs (
                playlist_id, title, author, is_collect, is_follow, 
                lyrics_path, audio_src, total_duration,
                bar_current_progress_sec, is_playing
            ) VALUES (?10, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        ",
        rusqlite::params![
            song.title,
            song.author.as_deref(),
            song.is_collect,
            song.is_follow,
            song.lyrics_path.as_ref().and_then(|p| p.to_str()),
            song.audio_src.to_str(),
            song.total_duration,
            song.bar_current_progress_sec,
            song.is_playing,
            id.to_string()
        ],
    );
    // let mut id = -1;
    match result {
        Ok(_) => {conn.last_insert_rowid()}
        Err(_) => {-1}
    }
}

pub fn update_lyrics(conn: &mut Connection, lyrics_file: &str, id: i64) -> i64{
    let _ = conn.execute(
        "UPDATE songs 
        SET
            lyrics_path = ?1
        WHERE
            id = ?2
        ",
        rusqlite::params![
            Some(lyrics_file),
            Some(id)
        ],
    );
    println!("更新歌词到数据库:{lyrics_file},{id}");
    conn.last_insert_rowid()
}


pub fn delete_song(conn: &mut Connection, id: i64) -> i64{
    let _ = conn.execute(
        "
        DELETE 
        FROM songs 
        WHERE
            id = ?1
        ",
        rusqlite::params![
            Some(id)
        ],
    );
    conn.last_insert_rowid()
}

pub fn get_playlists(conn: &Connection) -> Result<Vec<Playlists>, rusqlite::Error>{
    let sql = "
    SELECT
        id,
        name
    FROM playlists
    ORDER BY id
    ";

    let mut stmt = conn.prepare(sql)?;
    let playlists = stmt.query_map([], |row| {
        Ok(Playlists {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string()).unwrap_or_default();
    
    Ok(playlists)
}


pub fn get_song_all(conn: &Connection, id: i64) -> Result<Vec<Song>, rusqlite::Error>{
    let sql = "
    SELECT
        id,
        title,
        author,
        is_collect,
        is_follow,
        lyrics_path,
        audio_src,
        total_duration,
        bar_current_progress_sec,
        is_playing
    FROM songs
    WHERE playlist_id = ?1
    ORDER BY id
    limit 1000
    ";

    let mut stmt = conn.prepare(sql)?;
    let songs = stmt.query_map([id], |row| {
        Ok(Song {
            id: row.get(0)?,
            title: row.get(1)?,
            author: row.get(2)?,
            is_collect: row.get(3)?,
            is_follow: row.get(4)?,
            lyrics: vec![],
            lyrics_path: row.get::<_, Option<String>>(5)?.map(PathBuf::from),
            audio_src: row.get::<_, Option<String>>(6)?.map(PathBuf::from).unwrap_or_default(),
            total_duration: row.get(7)?,
            bar_current_progress_sec: row.get(8)?,
            is_playing: row.get(9)?,
        })
    })?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string()).unwrap_or_default();
    
    Ok(songs)
}



pub fn get_song_by_path(conn: &Connection, path: String, id: i64) -> Result<Song, rusqlite::Error>{
    let sql = "
            SELECT
                id,
                title,
                author,
                is_collect,
                is_follow,
                lyrics_path,
                audio_src,
                total_duration,
                bar_current_progress_sec,
                is_playing
            FROM songs 
            WHERE audio_src = ?1
            and playlist_id = ?2
    ";

    let mut stmt = conn.prepare(sql)?;
    let songs = stmt.query_map([path, id.to_string()], |row| {
        Ok(Song {
            id: row.get(0)?,
            title: row.get(1)?,
            author: row.get(2).ok(),
            is_collect: row.get(3)?,
            is_follow: row.get(4)?,
            lyrics: vec![],
            lyrics_path: row.get::<_, Option<String>>(5)?.map(PathBuf::from),
            audio_src: row.get::<_, Option<String>>(6)?.map(PathBuf::from).unwrap_or_default(),
            total_duration: row.get(7)?,
            bar_current_progress_sec: row.get(8)?,
            is_playing: row.get(9)?,
        })
    })?
    .collect::<Result<Vec<_>, _>>();
    println!("{:?}", songs);
    
    let song:Result<Song, rusqlite::Error> = songs.and_then(|v|{
        v.get(0).cloned().ok_or(rusqlite::Error::ExecuteReturnedResults)
    });
    song
}
