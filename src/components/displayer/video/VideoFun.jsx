import { convertFileSrc } from "@tauri-apps/api/tauri";
import { useState, useEffect, useRef, useImperativeHandle } from "react";

export const useVideoFun = (setData, ref) => {
  const playerRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [playing, setPlaying] = useState(true);
  const [videoVolume, setVideoVolume] = useState(0.5);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  useEffect(() => {
    setData((prevData) => ({
      ...prevData,
      barCurrentProgressSec: Math.floor(playedSeconds),
    }));
  }, [playedSeconds]);

  const play = async (id, filePath, duration, skipSecs, volume) => {
    setVideoSrc(convertFileSrc(filePath));
    setVideoVolume(volume / 100);
    setPlaying(true);
    playerRef.current?.getInternalPlayer()?.play();
    playerRef.current?.seekTo(skipSecs);
  };

  const handleFullscreen = () => {
    const videoElement = playerRef.current?.getInternalPlayer();

    if (videoElement?.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement?.webkitEnterFullscreen) {
      videoElement.webkitEnterFullscreen();
    } else {
      console.warn("Fullscreen API is not supported.");
    }
  };

  const pause = () => {
    playerRef.current?.getInternalPlayer()?.pause();
  };

  const resume = () => {
    playerRef.current?.getInternalPlayer()?.play();
  };

  const stop = () => {
    playerRef.current?.getInternalPlayer()?.pause();
    setVideoSrc("");
    setPlaying(false);
  };

  const seek = (sec, volume) => {
    playerRef.current?.seekTo(sec);
    setVideoVolume(volume / 100);
  };

  const setVolume = (volume) => {
    setVideoVolume(volume / 100);
  };

  useImperativeHandle(ref, () => ({
    play: play,
    pause: pause,
    resume: resume,
    stop: stop,
    setVolume: setVolume,
    seek: seek,
  }));

  return {
    playerRef,
    videoSrc,
    playing,
    videoVolume,
    setPlayedSeconds,
    handleFullscreen,
  };
};
