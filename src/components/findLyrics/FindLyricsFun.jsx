import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

export const useFindLyricsFun = (data, setData) => {
  const [songTitle, setSongTitle] = useState(data.title);
  const [resultList, setResultList] = useState([]);

  const [selectedRow, setSelectedRow] = useState(-1);

  const getDirectoryPath = (filePath) => {
    if (filePath === undefined || filePath === null) {
      return "";
    }
    const normalizedPath = filePath.replace(/\\/g, "/");
    const lastSlash = normalizedPath.lastIndexOf("/");
    if (lastSlash === -1) return "";
    return normalizedPath.substring(0, lastSlash);
  };

  const get_lyrics_targets = async (keyword) => {
    let lyrics_targets = await invoke("get_lyrics_targets", {
      keyword: keyword,
    });
    return lyrics_targets;
  };

  const get_lyrics = async (
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

  const selectSavePath = async (setSavePath) => {
    let selectedPath = "";

    selectedPath = await open({
      directory: true,
      multiple: false,
      filters: [
        {
          name: "lyrics",
          extensions: ["lrc"],
        },
      ],
    });
    setSavePath(selectedPath);
  };

  const searchLyrics = async (songTitle, setResultList) => {
    if (songTitle) {
      const results = await get_lyrics_targets(songTitle);
      setResultList(results);
    } else {
      alert("请填写歌名");
    }
  };

  const saveLyrics = async (
    resultList,
    selectedRow,
    savePath,
    selected,
    data,
    setData,
    songTitle
  ) => {
    const target = resultList[selectedRow];
    let title = songTitle;

    if (resultList !== undefined && resultList.length != 0) {
      title = resultList[selectedRow].title;
    }

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
        savePath + "\\" + title + ".lrc"
      );
      if (selected) {
        setData((prevData) => ({
          ...prevData,
          lyrics: lyrics,
        }));
        const _ = await invoke("add_lyrics", {
          lyricsFile: savePath + "\\" + title + ".lrc",
          id: data.id,
        });
      }
      alert("保存成功");
    }
  };

  const [savePath, setSavePath] = useState(getDirectoryPath(data.audioSrc));
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSongTitle(data.title);
    setSavePath(getDirectoryPath(data.audioSrc));
  }, [data.audioSrc]);

  return {
    selectSavePath,
    saveLyrics,
    searchLyrics,
    getDirectoryPath,
    savePath,
    setSavePath,
    selected,
    setSelected,
    songTitle,
    setSongTitle,
    resultList,
    setResultList,
    selectedRow,
    setSelectedRow,
  };
};
