import * as player from "../../../common/player"

// 计算并设置进度
export const updateProgress = (e, volumeBarRef, data, setData) =>  {

    let progressBarWidth = e.currentTarget.clientWidth;

    if (!volumeBarRef.current) {
      return 0;
    }
    const rect = volumeBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;



    let barCurrentVolume = Math.round((offsetX / progressBarWidth) * 100);
    if (barCurrentVolume <= 0) {
      barCurrentVolume = 0;
    }else if (barCurrentVolume >= 100) {
      barCurrentVolume = 100;
    }
    localStorage.setItem('barCurrentVolume', JSON.stringify(barCurrentVolume));

    return barCurrentVolume;
};

// 鼠标按下事件，开始拖动
export const handleMouseDown = (e, setIsDraggingVolume) => {
  setIsDraggingVolume(true);

  e.preventDefault();
};

// 鼠标移动事件，拖动进度
export const handleMouseMove = (e, volumeBarRef, data, setData, setCoordsVolume, isDraggingVolume) => {
  let barCurrentVolume = updateProgress(e, volumeBarRef, data, setData);
  const rect = volumeBarRef.current.getBoundingClientRect();
  setCoordsVolume({
    x: e.clientX,
    y: e.clientY,
    volume: barCurrentVolume,
    visible: true,
  });

  if (isDraggingVolume){
    setData(prevData => ({
      ...prevData,
      barCurrentVolume: barCurrentVolume
    }));
  }

};

// 鼠标松开事件，结束拖动
export const handleMouseUp = async (e, data, setData, coordsVolume, setCoordsVolume, isDraggingVolume, setIsDraggingVolume) => {
  let barCurrentVolume = coordsVolume.volume;

  setCoordsVolume((prev) => ({ ...prev, visible: false }));
  if (isDraggingVolume){

    const isMusic = player.checkIsMusic(data.audioSrc);
    let playFun = undefined;
    if (isMusic){
      playFun = data.music.current
    }else {
      playFun = data.video.current
    }
    if (data.isPlaying) {
      playFun.setVolume(barCurrentVolume);
    }
    setData(prevData => ({
      ...prevData,
      barCurrentVolume: barCurrentVolume
    }));
  }
  setIsDraggingVolume(false);
};


export const upVolume = (data, setData) => {
  let barCurrentVolume = data.barCurrentVolume;
  
  if (data.barCurrentVolume >= 100) {
    barCurrentVolume = 100;
  }else{
    barCurrentVolume = barCurrentVolume + 1;
  }
  localStorage.setItem('barCurrentVolume', JSON.stringify(barCurrentVolume));
  setData(prevData => ({
    ...prevData,
    barCurrentVolume: barCurrentVolume
  }));

  const isMusic = player.checkIsMusic(data.audioSrc);
  let playFun = undefined;
  if (isMusic){
    playFun = data.music.current
  }else {
    playFun = data.video.current
  }
  if (data.isPlaying) {
    playFun.setVolume(barCurrentVolume);
  }
}

export const downVolume = (data, setData) => {
  let barCurrentVolume = data.barCurrentVolume;

  if (barCurrentVolume <= 0) {
    barCurrentVolume = 0;
  }else{
    barCurrentVolume = barCurrentVolume - 1;
  }
  localStorage.setItem('barCurrentVolume', JSON.stringify(barCurrentVolume));
  setData(prevData => ({
    ...prevData,
    barCurrentVolume: barCurrentVolume
  }));

  const isMusic = player.checkIsMusic(data.audioSrc);
  let playFun = undefined;
  if (isMusic){
    playFun = data.music.current
  }else {
    playFun = data.video.current
  }
  if (data.isPlaying) {
    playFun.setVolume(barCurrentVolume);
  }
}