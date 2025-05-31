use super::db_song::Song;

#[derive(serde::Serialize)]
pub struct PlaylistSong {
    pub id: i64,
    pub name: String,
    pub songs: Vec<Song>,
}
