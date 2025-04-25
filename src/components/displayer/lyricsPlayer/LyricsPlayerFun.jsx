import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

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
    // console.log("歌词抬头：",metadata);
    console.log("歌词：",lyrics);
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