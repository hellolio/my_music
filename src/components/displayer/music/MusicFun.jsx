import { invoke } from "@tauri-apps/api/tauri";

// 处理按钮点击事件
export const leftClick = async (musicListImportState, data, setData) => {
    let index = musicListImportState.findIndex((song) => song.id === data.id);
  
    // const result = findMinMaxId(musicListImportState);
    const len = musicListImportState.length;
  
    if (index <= 0){
      index = len-1;
    }else{
      index = index - 1;
    }
    var audioMeta = musicListImportState[index];
  
    await invoke('stop_music');
    let song = await invoke('play_music', { id: data.playlistId, filePath: audioMeta.audio_src, duration: audioMeta.total_duration, skipSecs: 0, volume: data.barCurrentVolume/100 });
  
    setData(prevData => ({
      ...prevData,
      id: song.id,
      title: song.title,
      author: song.author,
      isCollect: song.is_collect,
      isFollow: song.is_follow,
      lyrics: song.lyrics,
      lyricsPath: song.lyrics_path,
      audioSrc: song.audio_src,
      totalDuration: song.total_duration,
      barCurrentProgressSec: 0,
      isPlaying: true,
      playerAlive: true
    }));
  };
  
  
  export const togglePlayPause = async (data, setData) => {
  
    // 当前没有播放
    if (!data.isPlaying){
  
      // 进度条马上播放就结束了
      if (data.totalDuration-data.barCurrentProgressSec<=1 || data.playState===-1) {
        let song = await invoke('play_music', { id: data.playlistId, filePath: data.audioSrc, duration: data.totalDuration, skipSecs: 0, volume: data.barCurrentVolume/100 });
  
        setData(prevData => ({
          ...prevData,
          id: song.id,
          title: song.title,
          author: song.author,
          isCollect: song.is_collect,
          isFollow: song.is_follow,
          lyrics: song.lyrics,
          lyricsPath: song.lyrics_path,
          audioSrc: song.audio_src,
          totalDuration: song.total_duration,
          barCurrentProgressSec: 0,
          playState: 1,
          isPlaying: data.isPlaying,
          playerAlive: true
        }));
      } else {
        await invoke('resume_music');
      }
    }else{
      await invoke('pause_music');
    }
    setData(prevData => ({
      ...prevData,
      isPlaying: !data.isPlaying
    }));
  };
  
  export const rightClick = async (musicListImportState, data, setData) => {
    let index = musicListImportState.findIndex((song) => song.id === data.id);
    const len = musicListImportState.length;
    // const result = findMinMaxId(musicListImportState);
    if (index >= len-1){
      index = 0;
    }else{
      index = index + 1;
    }
  
    var audioMeta = musicListImportState[index];
  
    await invoke('stop_music');
    let song = await invoke('play_music', { id: data.playlistId, filePath: audioMeta.audio_src, duration: audioMeta.total_duration, skipSecs: 0, volume: data.barCurrentVolume/100 });
    setData(prevData => ({
      ...prevData,
      id: song.id,
      title: song.title,
      author: song.author,
      isCollect: song.is_collect,
      isFollow: song.is_follow,
      lyrics: song.lyrics,
      lyricsPath: song.lyrics_path,
      audioSrc: song.audio_src,
      totalDuration: song.total_duration,
      barCurrentProgressSec: 0,
      isPlaying: true,
      playerAlive: true
    }));
  
  };
  