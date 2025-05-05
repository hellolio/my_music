use std::{
    sync::{mpsc, Arc, Mutex},
    thread,
    time::Duration,
};

use ffmpeg_next as ffmpeg;
use rodio::{OutputStream, Sink};
use tauri::Window;
use anyhow::{Error, Ok, Result};

#[derive(Debug)]
enum Command {
    Play,
    Pause,
    Resume,
    Seek(u64, f32), // seconds
    Stop,
    Volume(f32)
}

pub struct AudioPlayer {
    tx: Option<mpsc::Sender<Command>>,
}

impl AudioPlayer {
    pub fn new() -> Self{
        let audio_player = AudioPlayer {
            tx: None,
        };
        audio_player
    }
    pub fn music_play(&mut self, window: Window, file_path: String, duration: u64, skip_secs: u64, volume: f32) {
        let _ = self.create_music_player(window, file_path, duration, skip_secs, volume);
    }
    pub fn create_music_player(&mut self, window: Window, file_path: String, duration: u64, skip_secs: u64, volume: f32)-> Result<(), Error> {
        ffmpeg::init()?;

        let (tx, rx) = mpsc::channel::<Command>();

        self.tx = Some(tx);

        thread::spawn(move || {
            let mut ictx = ffmpeg::format::input(&file_path)?;
            let input = ictx
                .streams()
                .best(ffmpeg::media::Type::Audio)
                .expect("No audio stream found");

            let stream_index = input.index();
            println!("stream_index:{stream_index}");
            println!("duration:{duration}");

            let codec_params = input.parameters();
            let mut decoder = ffmpeg::codec::context::Context::from_parameters(codec_params)
                .unwrap()
                .decoder()
                .audio()
                ?;
                let mut resampler = ffmpeg::software::resampling::Context::get(
                    decoder.format(),       // 源格式
                    decoder.channel_layout(),
                    decoder.rate(),
                    ffmpeg::format::Sample::I16(ffmpeg::format::sample::Type::Packed), // 目标格式: i16
                    decoder.channel_layout(),
                    decoder.rate(),
                )?;
            
            if skip_secs != 0 {
                let skip_secs_tmp = skip_secs as i64 * 1_000_000;
                ictx.seek(skip_secs_tmp, 0..skip_secs_tmp)?;
            }

            let (_stream, stream_handle) = OutputStream::try_default()?;
            let sink = Arc::new(Mutex::new(Sink::try_new(&stream_handle)?));
            let mut current_ts: u64 = 0;
            let sleep_time = 10;
            let mut msg = Some(Command::Play);

            sink.lock().unwrap().set_volume(volume*2.0);

            loop {
                let tmp_msg = rx.try_recv().ok();
                match tmp_msg {
                    None => {}
                    _ => {
                        msg = tmp_msg;
                    }
                }
                match msg {
                    Some(Command::Play) => {
                        sink.lock().unwrap().play();
                        current_ts += sleep_time;
                    }
                    Some(Command::Pause) => {
                        sink.lock().unwrap().pause();
                    }
                    Some(Command::Resume) => {
                        sink.lock().unwrap().play();
                        current_ts += sleep_time;
                        msg = Some(Command::Play);
                    }
                    Some(Command::Seek(target_secs, volume)) => {
                        let seek_ts = (target_secs * 1_000_000) as i64;
                        println!("跳转播放到:{target_secs}");

                        // 执行seek操作
                        ictx.seek(seek_ts, 0..seek_ts)?;

                        decoder.flush(); // 清除缓冲
                        sink.lock().unwrap().stop(); // 清除播放
                        *sink.lock().unwrap() = Sink::try_new(&stream_handle)?;
                        current_ts = target_secs * 1000;
                        sink.lock().unwrap().set_volume(volume*2.0);
                        msg = Some(Command::Play);
                    }
                    Some(Command::Stop) => {
                        sink.lock().unwrap().stop();
                        println!("因为stop命令停止播放:{file_path}");
                        break;
                    }
                    Some(Command::Volume(volume)) => {
                        // sink.lock().unwrap().stop();
                        println!("音量调整了。。。{volume}");
                        sink.lock().unwrap().set_volume(volume*2.0);
                        msg = Some(Command::Play);
                    }
                    None => {}
                }

                if let Some((stream, packet)) = ictx.packets().next() {
                    if stream.index() != stream_index {
                        continue;
                    }

                    if let Err(e) = decoder.send_packet(&packet) {
                        println!("发送 packet 给解码器失败: {e}");
                        continue;
                    }

                    let mut decoded = ffmpeg::frame::Audio::empty();

                    while decoder.receive_frame(&mut decoded).is_ok() {
                        let mut converted = ffmpeg::frame::Audio::empty();
                        // 处理 F32(Planar)
                        if decoded.format() == ffmpeg::format::Sample::F32(ffmpeg::format::sample::Type::Planar) {
                            let channels = decoded.channels() as usize;
                            let samples_per_channel = decoded.samples();

                            let mut interleaved = Vec::with_capacity(channels * samples_per_channel);

                            for i in 0..samples_per_channel {
                                for ch in 0..channels {
                                    let samples = decoded.plane::<f32>(ch);
                                    if i >= samples.len() {
                                        eprintln!("Channel {} missing sample {}", ch, i);
                                        interleaved.push(0); // 填充静音
                                        continue;
                                    }
                                    let s = samples[i];
                                    let s_i16 = (s * i16::MAX as f32).clamp(i16::MIN as f32, i16::MAX as f32) as i16;
                                    interleaved.push(s_i16);
                                }
                            }
                        
                            let source = rodio::buffer::SamplesBuffer::new(
                                channels as u16,
                                decoded.rate() as u32,
                                interleaved,
                            );
                            sink.lock().unwrap().append(source);
                            continue;
                        }

                        // 检查是否需要重采样
                        if decoder.format() != ffmpeg::format::Sample::I16(ffmpeg::format::sample::Type::Packed) {
                            resampler.run(&decoded, &mut converted)?;
                            // 使用 converted
                        } else {
                            // 直接使用 decoded
                            converted = decoded.clone();
                        }

                        let samples: Vec<i16> = converted
                            .data(0)
                            .chunks_exact(2)
                            .map(|b| i16::from_ne_bytes([b[0], b[1]]))
                            .collect();

                        let source = rodio::buffer::SamplesBuffer::new(
                            converted.channels() as u16,
                            converted.rate() as u32,
                            samples,
                        );

                        sink.lock().unwrap().append(source);
                    }
                }
                else if sink.lock().unwrap().empty() {
                    println!("自动的播放完成：{file_path}");
                    window.emit("player_progress", -1).unwrap();
                    break;
                }
                if current_ts % 1000 == 0 {
                    window.emit("player_progress", current_ts)?;
                    // is_playing = true;
                }
                thread::sleep(Duration::from_millis(sleep_time as u64));
            }
            println!("播放线程已经关掉");
            Ok(())
        });

        Ok(())
    }

    pub fn music_resume(&self) {
        self.send_control(Command::Resume);
    }

    pub fn music_pause(&self) {
        self.send_control(Command::Pause);
    }

    pub fn music_seek(&self, seconds: u64, volume: f32) {
        self.send_control(Command::Seek(seconds, volume));
        // self.send_control(Command::Volume(volume));
    }

    pub fn music_stop(&self) {
        self.send_control(Command::Stop);
        thread::sleep(Duration::from_millis(100 as u64));
    }

    pub fn music_volume(&self, volume: f32) {
        self.send_control(Command::Volume(volume));
    }

    // 发送控制消息（暂停、恢复、停止）
    fn send_control(&self, control: Command) {
        if let Some(tx) = &self.tx {
            tx.send(control).unwrap_or_default();
            println!("Audio send_control");
        }
    }

}
