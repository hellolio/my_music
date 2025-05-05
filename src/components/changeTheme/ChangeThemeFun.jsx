
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";

export const get_lyrics_targets = async (keyword) => {

    let lyrics_targets = await invoke('get_lyrics_targets', { keyword: keyword });
    console.log("lyrics_targets:", lyrics_targets);
    return lyrics_targets;

}

export const get_lyrics = async (album, singer, songName, duration, id, savePath) => {

    let lyrics = await invoke('get_lyrics', {album: album, singer: singer, songName: songName, duration: duration, id: id, savePath: savePath});
    console.log("get_lyrics:", lyrics);
    return lyrics;
}

export const selectSavePath = async (setSavePath) => {
  const selectedFile = await open({
    multiple: false,
    filters: [
      {
        name: 'image',
        extensions: ['jpg', 'png']
      }
    ]
  });
  setSavePath(selectedFile);
  console.log("selectedFile :", savePath);

}


export const searchLyrics = async (songTitle, setResultList) => {
  if (songTitle) {
    const results = await get_lyrics_targets(songTitle);
    console.log("results:",results);
    setResultList(results);
  } else {
    alert('请填写歌名');
  }
};

export const saveLyrics = async (resultList, selectedRow, savePath, selected, data, setData) => {
  const target = resultList[selectedRow];
  console.log(target)
  if (savePath === '') {
    alert('请指定保存路径');
  } else if (target === undefined){
    alert('请先检索歌曲');
  }
  else {
    console.log("savePath:",savePath);
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

export const saveSetting = (data, setData, settingData, setSettingData, savePath, selected) => {

  setSettingData(prevData => ({
    ...prevData,
    isChange: !prevData.isChange,
    useMusicCover: selected,
    coverImagePath: savePath
  }));

}