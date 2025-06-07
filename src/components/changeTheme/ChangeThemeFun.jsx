import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export const get_lyrics_targets = async (keyword) => {
  let lyrics_targets = await invoke("get_lyrics_targets", { keyword: keyword });
  return lyrics_targets;
};

export const get_lyrics = async (
  album,
  singer,
  songName,
  duration,
  id,
  savePath
) => {
  let lyrics = await invoke("get_lyrics", {
    album: album,
    singer: singer,
    songName: songName,
    duration: duration,
    id: id,
    savePath: savePath,
  });
  return lyrics;
};

export const selectSavePath = async (setSavePath) => {
  const selectedFile = await open({
    multiple: false,
    filters: [
      {
        name: "image",
        extensions: ["jpg", "png"],
      },
    ],
  });
  setSavePath(selectedFile);
};

export const searchLyrics = async (songTitle, setResultList) => {
  if (songTitle) {
    const results = await get_lyrics_targets(songTitle);
    setResultList(results);
  } else {
    alert("请填写歌名");
  }
};

export const saveLyrics = async (
  resultList,
  selectedRow,
  savePath,
  selected,
  data,
  setData
) => {
  const target = resultList[selectedRow];
  if (savePath === "") {
    alert("请指定保存路径");
  } else if (target === undefined) {
    alert("请先检索歌曲");
  } else {
    const lyrics = await get_lyrics(
      target.album,
      target.artist[0],
      target.title,
      target.duration,
      target.id,
      savePath
    );
    if (selected) {
      setData((prevData) => ({
        ...prevData,
        lyrics: lyrics,
      }));
      const _ = await invoke("add_lyrics", {
        lyricsFile: savePath,
        id: data.id,
      });
    }
    alert("保存成功");
  }
};

export const saveSetting = (
  setSettingData,
  savePath,
  selected,
  backColor,
  backAlpha,
  backdropFilter
) => {
  const r = parseInt(backColor.slice(1, 3), 16);
  const g = parseInt(backColor.slice(3, 5), 16);
  const b = parseInt(backColor.slice(5, 7), 16);
  const backColorTmp = `rgba(${r},${g},${b},${backAlpha})`;

  setSettingData((prevData) => ({
    ...prevData,
    isChange: !prevData.isChange,
    useMusicCover: selected,
    coverImagePath: savePath,
    backColor: backColorTmp,
    backdropFilter: backdropFilter,
  }));
};

export const onChangeBackColor = (e) => {
  console.log(e.target.value);
};
