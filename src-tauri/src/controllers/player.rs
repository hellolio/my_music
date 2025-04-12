use std::{fs::File, io::BufReader};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
use std::path::Path;
use tauri::Window;
use rodio::{ source, Decoder, OutputStream, Sink, Source};

#[derive(Debug)]
pub enum PlayControl {
    Play,     // 播放
    Pause,    // 暂停
    Resume,   // 恢复播放
    Stop,     // 停止播放
    Seek      // 跳转至指定位置
}

pub struct AudioPlayer {
    tx: Option<mpsc::Sender<PlayControl>>,
    tx_sec: Option<mpsc::Sender<u64>>,
}
impl AudioPlayer {
    pub fn new() -> Self {
        let audio_player = AudioPlayer {
            tx: None,
            tx_sec: None
        };
        audio_player
    }

    pub fn play_audio(&mut self, window: Window, file_path: String, duration: u64, skip_secs: u64) {
        match &self.tx {
            Some(tx) => {
                // tx.send(PlayControl::Stop).unwrap();
                // println!("尝试关掉播放器重新打开");
                // self.create_audio(window, file_path, duration, skip_secs);
                // println!("重新打开一个播放线程");
                println!("尝试关掉播放器重新打开");
                loop {
                    let ok = tx.send(PlayControl::Stop);
                    match ok {
                        Ok(()) => {}
                        _ => {
                            self.create_audio(window, file_path, duration, skip_secs);
                            println!("重新打开一个播放线程");
                            break;
                        }
                    }
                }
            }
            None => {
                self.create_audio(window, file_path, duration, skip_secs);
            }
        }
    }

    fn create_audio(&mut self, window: Window, file_path: String, duration: u64, skip_secs: u64){
        let (tx, rx) = mpsc::channel::<PlayControl>();
        let (tx_sec, rx_sec) = mpsc::channel::<u64>();

        self.send_control(PlayControl::Play);
        self.tx = Some(tx);
        self.tx_sec = Some(tx_sec);

        thread::spawn(move || {
            // 初始化音频输出流
            let (_stream, stream_handle) = OutputStream::try_default().unwrap();

            // 创建 Sink 用于控制音频播放
            let sink = Sink::try_new(&stream_handle).unwrap();
            // 打开音频文件
            let file = File::open(&file_path).unwrap();
            // 解码音频文件,从指定位置播放
            let seek_position = Duration::from_secs(skip_secs);

            // let reader = BufReader::new(file);
            let reader = File::open(file_path).unwrap();

            let source = Decoder::new(reader).unwrap();

            sink.append(source.skip_duration(seek_position));

            let mut msg = Some(PlayControl::Play);
            let mut count_time = skip_secs*10;
            let mut is_playing = true;
            println!("播放开始。。");
            while !sink.empty() {
            // loop {
                let tmp = rx.try_recv().ok();
                match tmp {
                    None => {}
                    _ => {
                        msg = tmp;
                        println!("{:?}", msg);
                    }
                }
                
                match msg {
                    Some(PlayControl::Play) => {
                        if duration*10 - count_time >= 10 {
                            sink.play();
                            count_time += 1;
                        }
                    }
                    Some(PlayControl::Pause) => {
                        // 处理暂停
                        sink.pause();
                    }
                    Some(PlayControl::Resume) => {
                        // 处理恢复
                        if duration*10 - count_time >= 10 {
                            sink.play();
                            count_time += 1;
                        }
                    }
                    Some(PlayControl::Stop) => {
                        // 处理停止
                        sink.stop();
                        break;
                    }
                    Some(PlayControl::Seek) => {
                        // sink.stop();
                        let skip_sec = rx_sec.recv().unwrap();
                        println!("从第{skip_sec}秒开始播放");
                        count_time = skip_sec * 10;
                        sink.try_seek(Duration::from_secs(skip_sec)).unwrap();
                        sink.play();
                        msg = Some(PlayControl::Play);
                    }
                    None => {}
                }
                thread::sleep(Duration::from_millis(100));
                if duration*10 - count_time >= 10 {
                    if count_time % 10 == 0 {
                        // println!("当前播放进度：{count_time}");
                        window.emit("player_progress", count_time).unwrap();
                        is_playing = true;
                    }
                } else if is_playing {
                    if duration*10 - count_time < 15 {
                        sink.pause();
                        msg = Some(PlayControl::Pause);
                        is_playing = false;
                        thread::sleep(Duration::from_millis(500));
                        println!("播放结束");
                        window.emit("player_progress", duration*10).unwrap();
                    }
                }
            }
            println!("当前播放线程已结束");
            window.emit("player_progress", -1).unwrap();
        });
    }


    pub fn pause_audio(&self) {
        self.send_control(PlayControl::Pause);
    }

    pub fn resume_audio(&self) {
        self.send_control(PlayControl::Resume);
    }

    pub fn stop_audio(&self) {
        self.send_control(PlayControl::Stop);
    }

    pub fn seek_audio(&mut self, skip_secs: u64) {
        self.send_control(PlayControl::Seek);
        self.send_control_sec(skip_secs);
    }

    // 发送控制消息（暂停、恢复、停止）
    pub fn send_control(&self, control: PlayControl) {
        if let Some(tx) = &self.tx {
            tx.send(control).unwrap_or_default();
            println!("Audio send_control");
        }
    }
    pub fn send_control_sec(&self, sec: u64) {
        if let Some(tx_sec) = &self.tx_sec {
            tx_sec.send(sec).unwrap_or_default();
            println!("Audio send_control");
        }
    }
}
