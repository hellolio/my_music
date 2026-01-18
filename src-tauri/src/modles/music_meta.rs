#[derive(serde::Serialize)]
#[allow(dead_code)]
pub struct MusicMeta {
    pub name: String,
    pub path: String,
    pub duration: u64,
}
