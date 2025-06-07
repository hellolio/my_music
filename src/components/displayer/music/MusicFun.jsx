import { invoke } from "@tauri-apps/api/core";
import { useImperativeHandle } from "react";

export const useMusicFun = (ref) => {
  const get_cover = async (inputPath) => {
    const cover_image_path = await invoke("get_cover_from_music", {
      inputPath: inputPath,
    });
    return cover_image_path;
  };

  const play = async (id, filePath, duration, skipSecs, volume) => {
    try {
      const song = await invoke("play_music", {
        id: id,
        filePath: filePath,
        duration: duration,
        skipSecs: skipSecs,
        volume: volume / 100,
      });
      return song;
    } catch (error) {
      console.log(error);
    }
  };

  const pause = async () => {
    await invoke("pause_music");
  };

  const resume = async (volume) => {
    await invoke("resume_music", { volume: volume / 100 });
  };

  const stop = async () => {
    await invoke("stop_music");
  };

  const seek = async (sec, volume) => {
    await invoke("seek_music", { skipSecs: sec, volume: volume / 100 });
  };

  const setVolume = async (volume) => {
    await invoke("control_volume", { volume: volume / 100 });
  };

  useImperativeHandle(ref, () => ({
    get_cover: get_cover,
    play: play,
    pause: pause,
    resume: resume,
    stop: stop,
    setVolume: setVolume,
    seek: seek,
  }));

  return {};
};
