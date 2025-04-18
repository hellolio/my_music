import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";


// 双击列表的某首歌播放
export const playMusicFromList = async (id, audio_src, title, total_duration, data, setData) => {

    await invoke('stop_music');
    let song = await invoke('play_music', { id: data.playlistId, filePath: audio_src, duration: total_duration, skipSecs: 0, volume: data.barCurrentVolume/100 });
  
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
export const importMusic = async (songs, setSongs, playlistId, setCreatePlaylistFlg) =>{
    console.log("开始导入歌曲");
    console.log("songs:",songs);
  
    // 获取当前文件的状态
    let selectedFiles = await open({ multiple: true });
    console.log("selectedFiles :",selectedFiles);
  
    let songs_new = await invoke('import_music_to_db', { fileNames: selectedFiles, id: playlistId });
    setSongs(songs.concat(songs_new));
    setCreatePlaylistFlg(true);
}

export const getMusicListFormDB = async (setCurrentIndex, setAllSongList, setSongs, data, setData, setCreatePlaylistFlg) => {
    let musicLists = await invoke('get_song_all');
    console.log("musicLists:", musicLists);


    if (musicLists.length > 0){
        console.log("data.playlistId:", data.playlistId);
        let i = musicLists.findIndex((e) => e.id === data.playlistId);
        if (i === -1){
            i = 0;
        }

        let musicList = musicLists[i];
        setCurrentIndex(i);

        if (musicList.songs.length > 0) {
            let index = musicList.songs.findIndex((e) => e.title === data.title);
    
            if (index === -1) {
                index = 0;
            }
            // 应用启动时，取缓存的歌为当前歌曲
            setData(prevData => ({
                ...prevData,
                id: musicList.songs[index].id,
                playlistId: musicList.id,
                title: musicList.songs[index].title,
                author: musicList.songs[index].author,
                isCollect: musicList.songs[index].is_collect,
                isFollow: musicList.songs[index].is_follow,
                lyrics: musicList.songs[index].lyrics,
                lyricsPath: musicList.songs[index].lyrics_path,
                audioSrc: musicList.songs[index].audio_src,
                totalDuration: musicList.songs[index].total_duration,
                barCurrentProgressSec: 0,
                isPlaying: false,
                playerAlive: false
            }));
        }
    
        setSongs(musicList.songs);
        setAllSongList(musicLists);
        setCreatePlaylistFlg(false);
    }


  }

// 处理复选框的变化
export const handleCheckboxChange = (e, song, selectedItems, setSelectedItems) => {
    if (!selectedItems.includes(song)) {
        setSelectedItems((prevSelected) => [...prevSelected, song]);
    } else {
        setSelectedItems((prevSelected) =>
        prevSelected.filter((i) => i !== song)
        );
    }
};

// 取消/全选复选框的变化
export const handleAllCheckboxChange = (allCheck, setAllCheck, songs, setSelectedItems) => {
    if (allCheck) {
        setSelectedItems(songs);
    }else {
        setSelectedItems([]);
    }
    setAllCheck((prev) => !prev);
};



// 删除选中的项
export const deleteMusic = async (setSongs, selectedItems, setSelectedItems) => {
    console.log("selectedItems:", selectedItems);
    await invoke('delete_music_from_db', { songs: selectedItems });

    setSongs((prevItems) => prevItems.filter((song) => !selectedItems.includes(song)));
    getMusicListFormDB(setSongs)
    setSelectedItems([]);  // 删除后清空选中的项
};


// 切换到第 n 个歌单
export const switchTo = (index, id, setCurrentIndex, setData, setSongs, allSongList) => {
    setCurrentIndex(index);
    setData(prevData => ({
        ...prevData,
        playlistId: id
    }));
    let i = allSongList.findIndex((e) => e.id === id);
    setSongs(allSongList[i].songs);
};

export const handleCreate = async (playlistName, musicLists, setShowDialog, setPlaylistName, setCreatePlaylistFlg) => {
    if (musicLists.length >= 3) {
        alert('最多只能创建3个歌单');
        setShowDialog(false);
        setPlaylistName('');
        return;
    }
    if (playlistName.trim() === '') {
        alert('歌单名不能为空');
        return;
    }
    if (playlistName.length > 10) {
        alert('歌单名长度不能超过10字符');
        return;
      }

    let index = musicLists.findIndex((e) => e.name === playlistName);
    if (index === -1) {
        await invoke('create_playlist', { name: playlistName });
        setShowDialog(false);
        setPlaylistName('');
        setCreatePlaylistFlg(true);
    } else {
        alert('歌单名不能重复');
        return;
    }
  };

export const deletePlayList = async (allSongList, playlistId, setCreatePlaylistFlg) => {
    if (allSongList.length <= 1) {
        alert('至少需要保留一个歌单');
        return;
    }else {
        await invoke('delete_playlist', { playlistId: playlistId });
        setCreatePlaylistFlg(true);
    }


}