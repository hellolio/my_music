import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";


// 双击列表的某首歌播放
export const playMusicFromList = async (id, audio_src, title, total_duration, data, setData) => {

    await invoke('stop_music');
    let song = await invoke('play_music', { filePath: audio_src, duration: total_duration, skipSecs: 0, volume: data.barCurrentVolume/100 });
  
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
  
}

// 点击添加 导入音乐到数据库
export const importMusic = async (songs, setSongs) =>{
    console.log("开始导入歌曲");
    console.log("songs:",songs);
  
    // 获取当前文件的状态
    let selectedFiles = await open({ multiple: true });
    console.log("selectedFiles :",selectedFiles);
  
    let songs_new = await invoke('import_music_to_db', { fileNames: selectedFiles });
    setSongs(songs.concat(songs_new));
}

export const getMusicListFormDB = async (setMusicListImportState, setData) => {
    let musicList = await invoke('get_song_all');

    // 应用启动时，取第一首歌为当前歌曲
    setData(prevData => ({
      ...prevData,
      id: musicList[0].id,
      title: musicList[0].title,
      author: musicList[0].author,
      isCollect: musicList[0].is_collect,
      isFollow: musicList[0].is_follow,
      lyrics: musicList[0].lyrics,
      lyricsPath: musicList[0].lyrics_path,
      audioSrc: musicList[0].audio_src,
      totalDuration: musicList[0].total_duration,
      barCurrentProgressSec: 0,
      isPlaying: false,
      playerAlive: false
    }));
    setMusicListImportState(musicList);
  }

// 处理复选框的变化
export const handleCheckboxChange = (e, song, setSelectedItems) => {
    if (e.target.checked) {
        setSelectedItems((prevSelected) => [...prevSelected, song]);
    } else {
        setSelectedItems((prevSelected) =>
        prevSelected.filter((i) => i !== song)
        );
    }
};

// 删除选中的项
export const deleteMusic = async (setSongs, selectedItems, setSelectedItems) => {
    console.log("selectedItems:", selectedItems);
    await invoke('delete_music_from_db', { songs: selectedItems });

    setSongs((prevItems) => prevItems.filter((song) => !selectedItems.includes(song)));
    getMusicListFormDB(setSongs)
    setSelectedItems([]);  // 删除后清空选中的项
};