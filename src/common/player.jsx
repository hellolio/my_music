export const checkIsMusic = (filename) => {
  const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma"];
  const videoExtensions = [
    "mp4",
    "webm",
    "ogg",
    "avi",
    "mov",
    "mkv",
    "flv",
    "wmv",
  ];
  const ext = filename?.split(".").pop()?.toLowerCase() || "";
  const isAudioFile = audioExtensions.includes(ext);
  if (isAudioFile) {
    return true;
  } else if (videoExtensions.includes(ext)) {
    return false;
  } else {
    return true;
  }
};

// 处理按钮点击事件
export const leftClick = async (data, setData, allSongList) => {
  let currentSongIndex = allSongList.findIndex(
    (item) => item.id === data.playlistId
  );
  let index = allSongList[currentSongIndex].songs.findIndex(
    (song) => song.id === data.id
  );

  if (index <= 0) {
    index = allSongList[currentSongIndex].songs.length - 1;
  } else {
    index = index - 1;
  }
  var audioMeta = allSongList[currentSongIndex].songs[index];

  if (audioMeta.audio_src === null || data.audio_src === undefined) {
    return;
  }
  if (data.isMusic) {
    await data.music.current.stop();
  } else {
    await data.video.current.stop();
  }

  const isMusic = checkIsMusic(audioMeta.audio_src);
  let playFun = undefined;
  let coverImagePath = "";
  if (isMusic) {
    playFun = data.music.current;
    coverImagePath = await playFun.get_cover(audioMeta.audio_src);
  } else {
    playFun = data.video.current;
  }

  let song = await playFun.play(
    data.playlistId,
    audioMeta.audio_src,
    audioMeta.total_duration,
    0,
    data.barCurrentVolume
  );

  if (isMusic) {
    audioMeta.lyrics = song.lyrics;
  }
  setData((prevData) => ({
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
    isMusic: isMusic,
  }));
};

export const togglePlayPause = async (data, setData) => {
  if (data.audioSrc === null || data.audioSrc === undefined) {
    return;
  }
  togglePlayPausec(data, setData);
  setData((prevData) => ({
    ...prevData,
    isPlaying: !prevData.isPlaying,
  }));
};

export const togglePlayPausec = async (data, setData) => {
  const isMusic = checkIsMusic(data.audioSrc);
  let playFun = undefined;
  let coverImagePath = "";
  if (isMusic) {
    playFun = data.music.current;
    coverImagePath = await playFun.get_cover(data.audioSrc);
  } else {
    playFun = data.video.current;
  }

  // 当前没有播放
  if (!data.isPlaying) {
    if (data.playState === -1) {
      let song = await playFun.play(
        data.playlistId,
        data.audioSrc,
        data.totalDuration,
        0,
        data.barCurrentVolume
      );
      console.log("song:", song);
      if (song === null) {
        return;
      }

      if (isMusic) {
        data.lyrics = song.lyrics;
      }
      setData((prevData) => ({
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
        isMusic: isMusic,
      }));
    } else {
      await playFun.resume(data.barCurrentVolume);
    }
  } else {
    await playFun.pause();
  }
};

export const rightClick = async (data, setData, allSongList) => {
  let currentSongIndex = allSongList.findIndex(
    (item) => item.id === data.playlistId
  );
  let index = allSongList[currentSongIndex].songs.findIndex(
    (song) => song.id === data.id
  );

  if (index >= allSongList[currentSongIndex].songs.length - 1) {
    index = 0;
  } else {
    index = index + 1;
  }
  var audioMeta = allSongList[currentSongIndex].songs[index];
  if (audioMeta.audio_src === null || data.audio_src === undefined) {
    return;
  }
  if (data.isMusic) {
    await data.music.current.stop();
  } else {
    await data.video.current.stop();
  }

  if (audioMeta != undefined) {
    const isMusic = checkIsMusic(audioMeta.audio_src);
    let playFun = undefined;
    let coverImagePath = "";
    if (isMusic) {
      playFun = data.music.current;
      coverImagePath = await playFun.get_cover(audioMeta.audio_src);
    } else {
      playFun = data.video.current;
    }

    let song = await playFun.play(
      data.playlistId,
      audioMeta.audio_src,
      audioMeta.total_duration,
      0,
      data.barCurrentVolume
    );

    if (isMusic) {
      audioMeta.lyrics = song.lyrics;
    }

    setData((prevData) => ({
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
      isMusic: isMusic,
    }));
  }
};

export const cycleClick = async (data, setData) => {
  setData((prevData) => ({
    ...prevData,
    isSingleLoop: !data.isSingleLoop,
  }));
  localStorage.setItem("isSingleLoop", JSON.stringify(!data.isSingleLoop));
};

// 双击列表的某首歌播放
export const playMusicFromList = async (song, data, setData, playlistId) => {
  // return true;
  // let song = null;
  if (data.isMusic) {
    await data.music.current.stop();
  } else {
    await data.video.current.stop();
  }

  const isMusicCheck = checkIsMusic(song.audio_src);

  if (isMusicCheck) {
    console.log("song:", song);
    console.log("playlistId:", playlistId);
    // return
    await data.music.current.play(
      playlistId,
      song.audio_src,
      song.total_duration,
      0,
      data.barCurrentVolume
    );
    let coverImagePath = await data.music.current.get_cover(song.audio_src);
    setData((prevData) => ({
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
      isMusic: true,
    }));
  } else {
    await data.video.current.play(
      data.playlistId,
      song.audio_src,
      song.total_duration,
      0,
      data.barCurrentVolume
    );
    setData((prevData) => ({
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
      isMusic: false,
    }));
  }
};
