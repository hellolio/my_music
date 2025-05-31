

import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";


export const get_lyrics_targets = async (keyword) => {
    let lyrics_targets = await invoke('get_lyrics_targets', { keyword: keyword });
    return lyrics_targets;
}

export const get_lyrics = async (album, singer, songName, duration, id, savePath) => {
    let lyrics = await invoke('get_lyrics', {album: album, singer: singer, songName: songName, duration: duration, id: id, savePath: savePath});
    return lyrics;
}

export const selectSavePath = async (setSavePath, resultList, selectedRow, songTitle) => {
  let selectedPath = '';
  let title = songTitle;

  if (resultList !== undefined && resultList.length != 0) {
    title = resultList[selectedRow].title;
  }

  selectedPath = await open({
    directory: true,
    multiple: false,
  });
  setSavePath(selectedPath +'\\'+ title+ '.lrc');
}


export const searchLyrics = async (songTitle, setResultList) => {
  if (songTitle) {
    const results = await get_lyrics_targets(songTitle);
    setResultList(results);
  } else {
    alert('请填写歌名');
  }
};

export const saveLyrics = async (resultList, selectedRow, savePath, selected, data, setData) => {
  const target = resultList[selectedRow];
  if (savePath === '') {
    alert('请指定保存路径');
  } else if (target === undefined){
    alert('请先检索歌曲');
  }
  else {
    const lyrics = await get_lyrics(target.album, target.artist[0], target.title, target.duration, target.id, savePath);
    if (selected) {
      setData(prevData => ({
        ...prevData,
        lyrics: lyrics,
      }));
      const _ = await invoke('add_lyrics', { lyricsFile: savePath, id: data.id });
    }
    alert('保存成功');
  }
};
