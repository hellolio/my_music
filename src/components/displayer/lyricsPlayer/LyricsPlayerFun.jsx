import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import * as player from "../../../common/player"

export const importLyrics = async () =>{

  let selectedFile = await open({ multiple: false });
  return selectedFile;
}

export const addLyrics = async (data, setData) => {
    let lyricsPath = await importLyrics();

    const lyrics = await invoke('add_lyrics', { lyricsFile: lyricsPath, id: data.id });
    setData(prevData => ({
        ...prevData,
        lyrics: lyrics,
    }));


}

export const findIndex =(data) => {
  var currentTime = data.barCurrentProgressSec;
  
  var index = data.lyrics.findIndex((e) => e.time > currentTime);
  if (index === -1) {
    index = lrcArr.length;
  }
  return index - 1;
}

export const handleLyricClick = (line, index, data, setData) => {
  const isMusic = player.checkIsMusic(data.audioSrc);
  let playFun = undefined;
  if (isMusic){
      playFun = data.music.current
  }else {
      playFun = data.video.current
  }
  playFun.seek(Math.floor(line.time), data.barCurrentVolume);

  setData(prevData => ({
      ...prevData,
      isPlaying: true,
      barCurrentProgressSec: line.time
  }));
}