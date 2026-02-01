use std::{
    sync::{
        mpsc::{self, Receiver}
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
    ensure_ffmpeg_init();

    let mut ictx = ffmpeg::format::input(&file_path)?;

    let input = ictx
        .streams()
        .best(ffmpeg::media::Type::Audio)
        .ok_or_else(|| anyhow::anyhow!("no audio stream"))?;

    let stream_index = input.index();

    let mut decoder = ffmpeg::codec::context::Context::from_parameters(input.parameters())?
        .decoder()
        .audio()?;

    // ===== 音频参数 =====
    let out_rate = 48_000u32;
    let out_channels = decoder.channels() as u16;
    let out_format = Sample::F32(ffmpeg::format::sample::Type::Packed);

    let mut swr = SwrContext::get(
        decoder.format(),
        decoder.channel_layout(),
        decoder.rate(),
        out_format,
        decoder.channel_layout(),
        out_rate as u32,
    )?;

    // ===== rodio =====
    let (_stream, handle) = OutputStream::try_default()?;
    let sink = Sink::try_new(&handle)?;
    sink.set_volume(volume);

    // ===== seek =====
    if skip_secs > 0 {
        seek_and_warmup(&mut ictx, &mut decoder, stream_index, skip_secs)?;
    }

    // ===== PCM accumulator =====
    let mut pcm_acc: Vec<f32> = Vec::with_capacity(out_rate as usize);
    let min_prefill_samples = out_rate as usize / 3; // ~300ms
    let mut prefilled = 0usize;

    // ===== 时间 =====
    let mut base_ms = skip_secs as i64 * 1000;
    let mut playing = true;
    let mut start = Instant::now();
    let mut paused_at: Option<Instant> = None;
    let mut paused_total = Duration::ZERO;
    let mut last_emit = Instant::now();

    // 预缓冲
    while prefilled < min_prefill_samples {
        if !decode_once(
            &mut ictx,
            &mut decoder,
            stream_index,
            &mut swr,
            &mut pcm_acc,
            &sink,
            out_channels,
            out_rate,
            &mut prefilled,
        )? {
            break;
        }
    }

    // 主循环
    loop {
        // ===== 控制命令 =====
        if let Ok(cmd) = rx.try_recv() {
            match cmd {
                Command::Pause => {
                    sink.pause();
                    paused_at = Some(Instant::now());
                    playing = false;
                }
                Command::Resume(v) => {
                    sink.set_volume(v);
                    sink.play();
                    playing = true;
                    if let Some(p) = paused_at.take() {
                        paused_total += Instant::now() - p;
                    }
                }
                Command::Volume(v) => {
                    sink.set_volume(v);
                }
                Command::Seek(sec, v) => {
                    sink.stop();

                    let sink = Sink::try_new(&handle)?;
                    sink.set_volume(v);

                    seek_and_warmup(&mut ictx, &mut decoder, stream_index, sec)?;

                    pcm_acc.clear();
                    prefilled = 0;
                    base_ms = sec as i64 * 1000;
                    start = Instant::now();
                    paused_total = Duration::ZERO;
                    paused_at = None;
                    playing = true;

                    while prefilled < min_prefill_samples {
                        if !decode_once(
                            &mut ictx,
                            &mut decoder,
                            stream_index,
                            &mut swr,
                            &mut pcm_acc,
                            &sink,
                            out_channels,
                            out_rate,
                            &mut prefilled,
                        )? {
                            break;
                        }
                    }
                }
                Command::Stop => {
                    sink.stop();
                    return Ok(());
                }
            }
        }

        if playing {
            let alive = decode_once(
                &mut ictx,
                &mut decoder,
                stream_index,
                &mut swr,
                &mut pcm_acc,
                &sink,
                out_channels,
                out_rate,
                &mut prefilled,
            )?;

            if !alive && sink.empty() {
                window.emit("player_progress", -1).ok();
                break;
            }
        }

        // ===== progress =====
        let now = Instant::now();
        if now.duration_since(last_emit).as_millis() >= 500 {
            let played = now - start - paused_total;
            window.emit(
                "player_progress",
                base_ms + played.as_millis() as i64,
            ).ok();
            last_emit = now;
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

fn decode_once(
    ictx: &mut ffmpeg::format::context::Input,
    decoder: &mut ffmpeg::decoder::Audio,
    stream_index: usize,
    swr: &mut SwrContext,
    pcm_acc: &mut Vec<f32>,
    sink: &Sink,
    channels: u16,
    rate: u32,
    filled: &mut usize,
) -> Result<bool> {
    for (stream, packet) in ictx.packets() {
        if stream.index() != stream_index {
            continue;
        }

        if decoder.send_packet(&packet).is_err() {
            continue;
        }

        let mut frame = ffmpeg::frame::Audio::empty();
        while decoder.receive_frame(&mut frame).is_ok() {
            let samples = resample_into(swr, &frame, pcm_acc)?;
            *filled += samples;

            // ≥100ms 再 append
            if pcm_acc.len() >= rate as usize / 10 * channels as usize {
                sink.append(rodio::buffer::SamplesBuffer::new(
                    channels,
                    rate,
                    std::mem::take(pcm_acc),
                ));
            }
        }
        return Ok(true);
    }
    Ok(false)
}


fn resample_into(
    swr: &mut SwrContext,
    frame: &ffmpeg::frame::Audio,
    out: &mut Vec<f32>,
) -> Result<usize> {
    let mut out_frame = ffmpeg::frame::Audio::empty();
    swr.run(frame, &mut out_frame)?;

    let channels = out_frame.channels() as usize;
    let samples = out_frame.samples() as usize;
    let total = channels * samples;

    unsafe {
        let ptr = out_frame.data(0).as_ptr() as *const f32;
        let slice = std::slice::from_raw_parts(ptr, total);
        out.extend_from_slice(slice);
    }

    Ok(samples)
}
