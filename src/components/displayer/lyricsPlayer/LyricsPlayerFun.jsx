import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import * as utils from "../../../common/utils"

export const importLyrics = async () =>{
  console.log("开始导入歌曲");

  // 获取当前文件的状态
  let selectedFile = await open({ multiple: false });
  console.log("selectedFile :", selectedFile);

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
  console.log("line:", line);
  console.log("index:", index);
  const isMusic = utils.isMusic(data.audioSrc);
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