

export const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600); // 获取小时数
    const minutes = Math.floor((seconds-hours*3600) / 60); // 获取分钟数
    const remainingSeconds = seconds % 60; // 获取剩余的秒数

    // 返回格式化的时间，确保秒数为两位数
    return `${hours===0 ? '': hours+':'}${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
}

export const calculatePercentage = (part, total) => {
    if (total === 0) {
        return 0;  // 防止除以零
    }
    return Math.round((part / total) * 100);
}

export const isMusic = (filename) => {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv', 'wmv'];
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    const isAudioFile = audioExtensions.includes(ext);
    if (isAudioFile) {
        return true;
    } else if (videoExtensions.includes(ext)) {
        return false;
    } else {
        return true;
    }
}

// 双击列表的某首歌播放
export const playMusicFromList = async (song, data, setData) => {

    // return true;
    // let song = null;
    if (data.isMusic) {
        await data.music.current.stop();
    }else {
        await data.video.current.stop();
    }

    const isMusicCheck = isMusic(song.audio_src);

    if (isMusicCheck) {
        await data.music.current.play(data.playlistId, song.audio_src, song.total_duration, 0, data.barCurrentVolume);
        let coverImagePath = await data.music.current.get_cover(song.audio_src);
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
