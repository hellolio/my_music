// import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import * as utils from "../../../common/utils"

export const importMusic = async (musicListImportState, setMusicListImportState) =>{

  // 获取当前文件的状态
  let selectedFiles = await open({ multiple: true });

  let musicListImportState_new = await invoke('import_music_to_db', { fileNames: selectedFiles });
  setMusicListImportState(musicListImportState.concat(musicListImportState_new));
}

// 处理按钮点击事件
export const leftClick = async (data, setData, allSongList) => {
  let currentSongIndex = allSongList.findIndex((item) => item.id === data.playlistId);
  let index = allSongList[currentSongIndex].songs.findIndex((song) => song.id === data.id);

  if (index <= 0){
    index = allSongList[currentSongIndex].songs.length-1;
  }else{
    index = index - 1;
  }
  var audioMeta = allSongList[currentSongIndex].songs[index];

  if (data.isMusic) {
    await data.music.current.stop()
  }else {
    await data.video.current.stop()
  }

  const isMusic = utils.isMusic(audioMeta.audio_src);
  let playFun = undefined;
  let coverImagePath = "";
  if (isMusic){
    playFun = data.music.current
    coverImagePath = await playFun.get_cover(audioMeta.audio_src);
  }else {
    playFun = data.video.current
  }

  let song = await playFun.play(data.playlistId, audioMeta.audio_src, audioMeta.total_duration, 0, data.barCurrentVolume);

  if (isMusic) {
    audioMeta.lyrics = song.lyrics;
  }
  setData(prevData => ({
    ...prevData,
    id: audioMeta.id,
    title: audioMeta.title,
    author: audioMeta.author,
    coverImagePath: coverImagePath,
    isCollect: audioMeta.is_collect,
    isFollow: audioMeta.is_follow,
    lyrics: audioMeta.lyrics,
    lyricsPath: audioMeta.lyrics_path,
    audioSrc: audioMeta.audio_src,
    totalDuration: audioMeta.total_duration,
    barCurrentProgressSec: 0,
    isPlaying: true,
    playerAlive: true,
    isMusic: isMusic
  }));
};


export const togglePlayPause = async (data, setData) => {
  const isMusic = utils.isMusic(data.audioSrc);
  let playFun = undefined;
  let coverImagePath = "";
  if (isMusic){
    playFun = data.music.current;
    coverImagePath = await playFun.get_cover(data.audioSrc);
  }else {
    playFun = data.video.current
  }

  
  // 当前没有播放
  if (!data.isPlaying){

    if (data.playState===-1) {
      let song = await playFun.play(data.playlistId, data.audioSrc, data.totalDuration, 0, data.barCurrentVolume);

      if (isMusic) {
        data.lyrics = song.lyrics;
      }
      setData(prevData => ({
        ...prevData,
        id: data.id,
        title: data.title,
        author: data.author,
        coverImagePath: coverImagePath,
        isCollect: data.isCollect,
        isFollow: data.isFollow,
        lyrics: data.lyrics,
        lyricsPath: data.lyricsPath,
        audioSrc: data.audioSrc,
        totalDuration: data.totalDuration,
        barCurrentProgressSec: 0,
        playState: 1,
        isPlaying: true,
        playerAlive: true,
        isMusic: isMusic
      }));
    } else {
      // await invoke('resume_music');
      await playFun.resume()
    }
  }else{
      await playFun.pause()
      // await invoke('pause_music');
  }
  setData(prevData => ({
    ...prevData,
    isPlaying: !data.isPlaying
  }));
};

export const rightClick = async (data, setData, allSongList) => {
  let currentSongIndex = allSongList.findIndex((item) => item.id === data.playlistId);
  let index = allSongList[currentSongIndex].songs.findIndex((song) => song.id === data.id);


  if (index >= allSongList[currentSongIndex].songs.length-1){
    index = 0;
  }else{
    index = index + 1;
  }
  var audioMeta = allSongList[currentSongIndex].songs[index];
  
  if (data.isMusic) {
    await data.music.current.stop()
  }else {
    await data.video.current.stop()
  }
  
  if (audioMeta != undefined) {
    const isMusic = utils.isMusic(audioMeta.audio_src);
    let playFun = undefined;
    let coverImagePath = "";
    if (isMusic){
      playFun = data.music.current
      coverImagePath = await playFun.get_cover(audioMeta.audio_src);
    }else {
      playFun = data.video.current
    }
  
    let song = await playFun.play(data.playlistId, audioMeta.audio_src, audioMeta.total_duration, 0, data.barCurrentVolume);
    
    if (isMusic) {
      audioMeta.lyrics = song.lyrics;
    }
  
    setData(prevData => ({
      ...prevData,
      id: audioMeta.id,
      title: audioMeta.title,
      author: audioMeta.author,
      coverImagePath: coverImagePath,
      isCollect: audioMeta.is_collect,
      isFollow: audioMeta.is_follow,
      lyrics: audioMeta.lyrics,
      lyricsPath: audioMeta.lyrics_path,
      audioSrc: audioMeta.audio_src,
      totalDuration: audioMeta.total_duration,
      barCurrentProgressSec: 0,
      isPlaying: true,
      playerAlive: true,
      isMusic: isMusic
    }));
  }

};


export const cycleClick = async (data, setData) => {
  setData(prevData => ({
    ...prevData,
    isSingleLoop: !data.isSingleLoop
  }));
  localStorage.setItem('isSingleLoop', JSON.stringify(!data.isSingleLoop));
}

