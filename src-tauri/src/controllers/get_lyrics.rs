use std::collections::HashMap;

use anyhow::{Ok, Result};
use base64::{engine::general_purpose, Engine};
use rand::Rng;
use reqwest::Client;
use serde::Serialize;
use serde_json::{json, Value};

use crate::{common::decrypt_qq_lyrics, modles::songs_for_lyrics::SongsForLyrics};

#[derive(Serialize)]
struct Comm {
    g_tk: i64,
    uin: i64,
    format: String,
    in_charset: String,
    out_charset: String,
    notice: i32,
    platform: String,
    need_new_code: i32,
    ct: i32,
    cv: i32,
}

#[derive(Serialize)]
struct Param {
    num_per_page: i32,
    page_num: i32,
    query: String,
    search_type: i32,
}

#[derive(Serialize)]
struct RequestData {
    comm: Comm,
    req_0: HashMap<String, serde_json::Value>,
}

pub async fn get_qq_lyrics(keyword: String) -> Result<Vec<SongsForLyrics>> {
    let url = "https://u.y.qq.com/cgi-bin/musicu.fcg";

    let comm = Comm {
        g_tk: 997034911,
        uin: rand::rng().random_range(1000000000..9999999999), // 随机生成 uin
        format: "json".to_string(),
        in_charset: "utf-8".to_string(),
        out_charset: "utf-8".to_string(),
        notice: 0,
        platform: "h5".to_string(),
        need_new_code: 1,
        ct: 23,
        cv: 0,
    };

    let param = Param {
        num_per_page: 20,
        page_num: 1,
        query: keyword,
        search_type: 0,
    };

    let mut req_0 = HashMap::new();
    req_0.insert(
        "method".to_string(),
        serde_json::json!("DoSearchForQQMusicDesktop"),
    );
    req_0.insert(
        "module".to_string(),
        serde_json::json!("music.search.SearchCgiService"),
    );
    req_0.insert("param".to_string(), serde_json::json!(param));

    let request_data = RequestData { comm, req_0 };

    // 创建 HTTP 客户端
    let client = Client::new();

    // 发送 POST 请求
    let response = client
        .post(url)
        .json(&request_data)
        .header("Accept", "*/*")
        // .header("Accept-Encoding", "gzip, deflate")
        .header("Accept-Language", "zh-CN")
        .header(
            "User-Agent",
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)",
        )
        .timeout(std::time::Duration::from_secs(4))
        .send()
        .await?;

    // 获取响应结果
    let body = response.text().await?;
    // 解析 JSON 字符串为 serde_json::Value
    let json: Value = serde_json::from_str(&body)?;

    // 使用 `get` 获取嵌套的字段
    let mut songs: Vec<SongsForLyrics> = vec![];
    if let Some(req_0) = json.get("req_0") {
        if let Some(data) = req_0.get("data") {
            if let Some(body) = data.get("body") {
                let list = body
                    .get("song")
                    .ok_or(anyhow::anyhow!("not found song"))?
                    .get("list")
                    .and_then(Value::as_array)
                    .ok_or(anyhow::anyhow!("not found list"))?;

                for i in list {
                    let singer = i
                        .get("singer")
                        .and_then(Value::as_array)
                        .ok_or(anyhow::anyhow!("not found singer"))?;
                    let mut artists = vec![];
                    for y in singer {
                        let artist = y.get("name").ok_or(anyhow::anyhow!("not found name"))?;
                        if artist != "" {
                            artists.push(artist.to_string().replace("\"", ""));
                        }
                    }
                    artists.push("".to_string());

                    let id = i.get("id").ok_or(anyhow::anyhow!("not found id"))?;
                    let mid = i.get("mid").ok_or(anyhow::anyhow!("not found mid"))?;
                    let title = i.get("title").ok_or(anyhow::anyhow!("not found title"))?;
                    let subtitle = i
                        .get("subtitle")
                        .ok_or(anyhow::anyhow!("not found subtitle"))?;
                    let album = i
                        .get("album")
                        .ok_or(anyhow::anyhow!("not found album"))?
                        .get("name")
                        .ok_or(anyhow::anyhow!("not found name"))?;
                    let duration = i
                        .get("interval")
                        .ok_or(anyhow::anyhow!("not found interval"))?;
                    let songs_for_lyrics = SongsForLyrics {
                        id: id.to_string().replace("\"", "").parse::<i64>().unwrap_or(0),
                        mid: mid.to_string().replace("\"", ""),
                        title: title.to_string().replace("\"", ""),
                        subtitle: subtitle.to_string().replace("\"", ""),
                        artist: artists,
                        album: album.to_string().replace("\"", ""),
                        duration: duration.to_string().parse::<u32>().unwrap_or(0),
                    };
                    songs.push(songs_for_lyrics);
                }
            }
        }
    }
    Ok(songs)
}

pub async fn get_qq_lytics_by_id(
    album_name: &str,
    singer: &str,
    song_name: &str,
    duration: u32,
    id: i64,
) -> Result<String> {
    let url = "https://u.y.qq.com/cgi-bin/musicu.fcg";

    let base64_album_name = general_purpose::STANDARD.encode(album_name);
    let base64_singer_name = general_purpose::STANDARD.encode(singer);
    let base64_song_name = general_purpose::STANDARD.encode(song_name);

    let data = json!({
        "comm": {
            "_channelid": "0",
            "_os_version": "6.2.9200-2",
            "authst": "",
            "ct": "19",
            "cv": "1942",
            "patch": "118",
            "psrf_access_token_expiresAt": 0,
            "psrf_qqaccess_token": "",
            "psrf_qqopenid": "",
            "psrf_qqunionid": "",
            "tmeAppID": "qqmusic",
            "tmeLoginType": 0,
            "uin": "0",
            "wid": "0"
        },
        "music.musichallSong.PlayLyricInfo.GetPlayLyricInfo": {
            "method": "GetPlayLyricInfo",
            "module": "music.musichallSong.PlayLyricInfo",
            "param": {
                "albumName": base64_album_name,
                "crypt": 1,
                "ct": 19,
                "cv": 1942,
                "interval": duration,
                "lrc_t": 0,
                "qrc": 1,
                "qrc_t": 0,
                "roma": 1,
                "roma_t": 0,
                "singerName": base64_singer_name,
                "songID": id,
                "songName": base64_song_name,
                "trans": 1,
                "trans_t": 0,
                "type": 0
            }
        }
    });

    let client = Client::new();
    let response = client
        .post(url)
        .header("Accept", "*/*")
        // .header("Accept-Encoding", "gzip, deflate")
        .header("Accept-Language", "zh-CN")
        .header(
            "User-Agent",
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)",
        )
        .json(&data)
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await?;

    // let status = response.status();
    let body = response.text().await?;
    // 解析 JSON 字符串为 serde_json::Value
    let json: Value = serde_json::from_str(&body)?;
    let lyrics_base64 = json
        .get("music.musichallSong.PlayLyricInfo.GetPlayLyricInfo")
        .ok_or(anyhow::anyhow!("not found interval"))?
        .get("data")
        .ok_or(anyhow::anyhow!("not found interval"))?
        .get("lyric")
        .ok_or(anyhow::anyhow!("not found interval"))?
        .to_string()
        .replace("\"", "");

    let lyrics = decrypt_qq_lyrics::decrypt_qq_lyrics(&lyrics_base64);

    lyrics
}
