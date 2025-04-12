import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";


export const importMusic = async (musicListImportState, setMusicListImportState) =>{
  console.log("开始导入歌曲");

  // 获取当前文件的状态
  let selectedFiles = await open({ multiple: true });
  console.log("selectedFiles :",selectedFiles);

  let musicListImportState_new = await invoke('import_music_to_db', { fileNames: selectedFiles });
  setMusicListImportState(musicListImportState.concat(musicListImportState_new));
  console.log("musicListImportState_new :",musicListImportState_new);
  console.log("musicListImportState :",musicListImportState);
}

const findMinMaxId = (list) => {
  // 初始化minId和maxId，假设list非空
  const { minId, maxId } = list.reduce((acc, item) => {
    if (item.id < acc.minId) {
      acc.minId = item.id;
    }
    if (item.id > acc.maxId) {
      acc.maxId = item.id;
    }
    return acc;
  }, { minId: Infinity, maxId: -Infinity }); // 初始值设置为Infinity和- Infinity

  return { minId, maxId };
};

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
  let song = await invoke('play_music', { filePath: audioMeta.audio_src, duration: audioMeta.total_duration, skipSecs: 0, volume: data.barCurrentVolume/100 });

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
      let song = await invoke('play_music', { filePath: data.audioSrc, duration: data.totalDuration, skipSecs: 0, volume: data.barCurrentVolume/100 });

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
  let song = await invoke('play_music', { filePath: audioMeta.audio_src, duration: audioMeta.total_duration, skipSecs: 0, volume: data.barCurrentVolume/100 });
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


export const cycleClick = async (data, setData) => {
  setData(prevData => ({
    ...prevData,
    isSingleLoop: !data.isSingleLoop
  }));
  localStorage.setItem('isSingleLoop', JSON.stringify(!data.isSingleLoop));
}

export const handleTogglePanel = (setShowPanel) => {
  setShowPanel((prev => !prev));
};

