#[derive(serde::Serialize)]
pub struct MusicMeta {
    pub name: String,
    pub path: String,
    pub duration: u64,
}
