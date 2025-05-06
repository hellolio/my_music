import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import * as utils from "../../common/utils"


// 双击列表的某首歌播放
export const playMusicFromList = async (song, data, setData) => {
    // let song = null;
    if (data.isMusic) {
        await data.music.current.stop();
    }else {
        await data.video.current.stop();
    }
    const isMusic = utils.isMusic(song.audio_src);
    if (isMusic) {
        await data.music.current.play(data.playlistId, song.audio_src, song.total_duration, 0, data.barCurrentVolume);
        let coverImagePath = await data.music.current.get_cover(song.audio_src)
        setData(prevData => ({
            ...prevData,
            id: song.id,
            title: song.title,
            author: song.author,
            coverImagePath: coverImagePath,
            isCollect: song.is_collect,
            isFollow: song.is_follow,
            lyrics: song.lyrics,
            lyricsPath: song.lyrics_path,
            audioSrc: song.audio_src,
            totalDuration: song.total_duration,
            barCurrentProgressSec: 0,
            isPlaying: true,
            playerAlive: true,
            isMusic: true,
        }));
    } else {
        await data.video.current.play(data.playlistId, song.audio_src, song.total_duration, 0, data.barCurrentVolume);
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
            playerAlive: true,
            isMusic: false,
          }));
    }
}

// 点击添加 导入音乐到数据库
export const importMusic = async (songs, setSongs, playlistId, setUpdatePlayListFlg) =>{
  
    // 获取当前文件的状态
    let selectedFiles = await open({ multiple: true });
  
    let songs_new = await invoke('import_music_to_db', { fileNames: selectedFiles, id: playlistId });
    setSongs(songs.concat(songs_new));
    setUpdatePlayListFlg(true);
}

export const getMusicListFormDB = async (setCurrentIndex, setAllSongList, setSongs, data, setData, setUpdatePlayListFlg) => {
    let musicLists = await invoke('get_song_all');

    if (musicLists.length > 0){
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
        setUpdatePlayListFlg(false);
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
export const deleteMusic = async (setSongs, selectedItems, setSelectedItems, setUpdatePlayListFlg) => {
    await invoke('delete_music_from_db', { songs: selectedItems });

    setSongs((prevItems) => prevItems.filter((song) => !selectedItems.includes(song)));
    getMusicListFormDB(setSongs)
    setSelectedItems([]);  // 删除后清空选中的项
    setUpdatePlayListFlg(true);
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

export const deletePlayList = async (param) => {
    if (param.allSongList.length <= 1) {
        alert('至少需要保留一个歌单');
        param.setShowConfirmDialog(false);
        return;
    }else {
        await invoke('delete_playlist', { playlistId: param.playlistId });
        param.setShowConfirmDialog(false);
        param.setUpdatePlayListFlg(true);
    }
}


export const handleCreate = async (param) => {
    if (param.allSongList.length >= 10) {
        alert('最多只能创建3个歌单');
        param.setShowDialog(false);
        param.setPlaylistName('');
        return;
    }
    if (param.playlistName.trim() === '') {
        alert('歌单名不能为空');
        return;
    }
    if (param.playlistName.length > 10) {
        alert('歌单名长度不能超过10字符');
        return;
      }

    let index = param.allSongList.findIndex((e) => e.name === param.playlistName);
    if (index === -1) {
        await invoke('create_playlist', { name: param.playlistName });
        param.setShowDialog(false);
        param.setPlaylistName('');
        param.setUpdatePlayListFlg(true);
    } else {
        alert('歌单名不能重复');
        return;
    }
  };
