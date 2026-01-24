use std::{
    sync::{
        mpsc::{self, Receiver},
        Arc, Mutex,
    },
    thread,
    time::Duration,
};

use ffmpeg::software::resampling::Context as SwrContext;
use ffmpeg::format::Sample;

use anyhow::{Result};
use ffmpeg_next as ffmpeg;
use rodio::{OutputStream, Sink};
use tauri::{Emitter, Window};
use tokio::time::Instant;

use mimalloc::MiMalloc;


use std::sync::Once;

static FFMPEG_INIT: Once = Once::new();

fn ensure_ffmpeg_init() {
    FFMPEG_INIT.call_once(|| {
        ffmpeg::init().expect("ffmpeg init failed");
    });
}

#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

#[derive(Debug)]
enum Command {
    Pause,
    Resume(f32),
    Seek(u64, f32), // seconds
    Stop,
    Volume(f32),
}

pub struct AudioPlayer {
    tx: Option<mpsc::Sender<Command>>,
    handle: Option<std::thread::JoinHandle<()>>,
}

impl AudioPlayer {
    pub fn new() -> Self {
        Self { tx: None, handle: None }
    }

    pub fn music_play(
        &mut self,
        window: Window,
        file_path: String,
        skip_secs: u64,
        volume: f32,
    ) -> Result<()> {
        ensure_ffmpeg_init();
        self.music_stop(); // 确保旧线程彻底退出

        let (tx, rx) = mpsc::channel();
        self.tx = Some(tx);

        let handle = thread::spawn(move || {
            if let Err(e) = run_player(window, file_path, skip_secs, volume, rx) {
                eprintln!("audio thread error: {e:?}");
            }
        });

        self.handle = Some(handle);
        Ok(())
    }

    pub fn music_pause(&self) {
        if let Some(tx) = &self.tx {
            let _ = tx.send(Command::Pause);
        }
    }

    pub fn music_resume(&self, volume: f32) {
        if let Some(tx) = &self.tx {
            let _ = tx.send(Command::Resume(volume));
        }
    }

    pub fn music_seek(&self, secs: u64, volume: f32) {
        if let Some(tx) = &self.tx {
            let _ = tx.send(Command::Seek(secs, volume));
        }
    }

    pub fn music_stop(&mut self) {
        if let Some(tx) = &self.tx {
            let _ = tx.send(Command::Stop);
        }

        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }

        self.tx = None;
    }

    pub fn music_volume(&self, volume: f32) {
        if let Some(tx) = &self.tx {
            let _ = tx.send(Command::Volume(volume));
        }
    }
}

fn run_player(
    window: Window,
    file_path: String,
    skip_secs: u64,
    volume: f32,
    rx: Receiver<Command>,
) -> Result<()> {
    let mut ictx = ffmpeg::format::input(&file_path)?;

    let input = ictx
        .streams()
        .best(ffmpeg::media::Type::Audio)
        .ok_or_else(|| anyhow::anyhow!("no audio stream"))?;

    let stream_index = input.index();

    let mut decoder = ffmpeg::codec::context::Context::from_parameters(input.parameters())?
        .decoder()
        .audio()?;


    let in_rate = decoder.rate();
    let in_layout = decoder.channel_layout();
    let in_format = decoder.format();

    let out_rate = 48_000;
    let out_layout = in_layout; // 一般不改声道
    let out_format = Sample::F32(ffmpeg::format::sample::Type::Packed);

    let mut swr = SwrContext::get(
        in_format,
        in_layout,
        in_rate,
        out_format,
        out_layout,
        out_rate,
    )?;


    let (_stream, handle) = OutputStream::try_default()?;
    let sink = Arc::new(Mutex::new(Sink::try_new(&handle)?));
    sink.lock().unwrap().set_volume(volume);

    // 初始 seek
    if skip_secs > 0 {
        seek_and_warmup(&mut ictx, &mut decoder, stream_index, skip_secs)?;
    }

    let mut playing = true;

    let mut base_ms: i64 = (skip_secs as i64) * 1000; // seek 基准
    let mut playing_start: Option<Instant> = Some(Instant::now());
    let mut accumulated_pause: Duration = Duration::ZERO;
    let mut pause_start: Option<Instant> = None;

    let mut last_emit = Instant::now();


    loop {
        // 控制消息
        match rx.recv_timeout(Duration::from_millis(20)) {
            Ok(cmd) => {
                match cmd {
                    Command::Pause => {
                        sink.lock().unwrap().pause();
                        pause_start = Some(Instant::now());
                        playing = false;
                        println!("playback Pause");
                    }
                    Command::Resume(v) => {
                        sink.lock().unwrap().set_volume(v);
                        sink.lock().unwrap().play();
                        playing = true;
                        println!("playback Resume");
                        if let Some(p) = pause_start.take() {
                            accumulated_pause += Instant::now() - p;
                        }
                    }
                    Command::Volume(v) => {
                        println!("playback Volume");
                        sink.lock().unwrap().set_volume(v);
                    }
                    Command::Seek(sec, v) => {
                        println!("playback Seek");
                        sink.lock().unwrap().clear();
                        *sink.lock().unwrap() = Sink::try_new(&handle)?;
                        sink.lock().unwrap().set_volume(v);

                        seek_and_warmup(&mut ictx, &mut decoder, stream_index, sec)?;
                        playing = true;

                        base_ms = sec as i64 * 1000;
                        playing_start = Some(Instant::now());
                        accumulated_pause = Duration::ZERO;
                        pause_start = None;

                        window.emit("player_progress", base_ms).ok();

                    }
                    Command::Stop => {
                        println!("playback pausStoped");
                        sink.lock().unwrap().clear();
                        // window.emit("player_progress", -1).ok();
                        return Ok(());
                    }

                }
            }

            Err(mpsc::RecvTimeoutError::Timeout) => {
                // 正常播放流程
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => {
                sink.lock().unwrap().clear();
                window.emit("player_progress", -1).ok();
                println!("command channel disconnected, stopping playback");
                return Ok(());
            }

        }

        if !playing {
            thread::sleep(Duration::from_millis(200));
            continue;
        }

        // 读取 packet
        let mut got_packet = false;
        for (stream, packet) in ictx.packets() {
            if stream.index() != stream_index {
                continue;
            }
            got_packet = true;

            if decoder.send_packet(&packet).is_err() {
                continue;
            }

            let mut frame = ffmpeg::frame::Audio::empty();
            while decoder.receive_frame(&mut frame).is_ok() {
                output_frame_resampled(&sink, &mut swr, &frame)?;
            }
            break;
        }

        if !got_packet {
            if sink.lock().unwrap().empty() {
                window.emit("player_progress", -1).ok();
                break;
            }
            thread::sleep(Duration::from_millis(100));
        }

        if let Some(start) = playing_start {
            let now = Instant::now();
            let played = now - start - accumulated_pause;
            let milliseconds = base_ms + played.as_millis() as i64;

            if now.duration_since(last_emit).as_millis() >= 500 {
                window.emit("player_progress", milliseconds).ok();
                last_emit = now;
            }
        }

    }

    Ok(())
}

/// seek + 丢帧预热（FLAC / AAC 必须）
fn seek_and_warmup(
    ictx: &mut ffmpeg::format::context::Input,
    decoder: &mut ffmpeg::decoder::Audio,
    stream_index: usize,
    seconds: u64,
) -> Result<()> {
    let ts = seconds as i64 * ffmpeg::ffi::AV_TIME_BASE as i64;
    ictx.seek(ts, ..)?;
    decoder.flush();

    // 丢弃不稳定帧
    let mut warmed = 0;
    for (s, p) in ictx.packets() {
        if s.index() != stream_index {
            continue;
        }
        if decoder.send_packet(&p).is_err() {
            continue;
        }

        let mut f = ffmpeg::frame::Audio::empty();
        while decoder.receive_frame(&mut f).is_ok() {
            warmed += 1;
            if warmed >= 3 {
                return Ok(());
            }
        }
    }
    Ok(())
}

fn output_frame_resampled(
    sink: &Arc<Mutex<Sink>>,
    swr: &mut ffmpeg::software::resampling::Context,
    frame: &ffmpeg::frame::Audio,
) -> Result<()> {
    let mut out = ffmpeg::frame::Audio::empty();

    // 执行重采样
    swr.run(frame, &mut out)?;

    match out.format() {
        ffmpeg::format::Sample::F32(ffmpeg::format::sample::Type::Packed) => {

            let channels = out.channels() as usize;
            let samples_per_channel = out.samples() as usize;
            let rate = out.rate() as u32;

            let data = out.data(0);
            let total_floats = samples_per_channel * channels;
            let mut samples = Vec::<f32>::with_capacity(total_floats);

            unsafe {
                let src = data.as_ptr() as *const f32;
                let slice = std::slice::from_raw_parts(src, total_floats);
                samples.extend_from_slice(slice);
            }

            sink.lock().unwrap().append(
                rodio::buffer::SamplesBuffer::new(
                    channels as u16,
                    rate,
                    samples.to_vec(),
                ),
            );
        }
        _ => {
            // 理论上不会走到这里
        }
    }

    Ok(())
}