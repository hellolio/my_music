use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Lyric {
    pub(crate) time: f64,
    pub(crate) text: String,
}
