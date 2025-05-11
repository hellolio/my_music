import * as player from "../../../common/player"

// 计算并设置进度
export const updateProgress = (e, volumeBarRef, data, setData) =>  {
    // 获取进度条容器的宽度
    let progressBarWidth = e.currentTarget.clientWidth;

    if (!volumeBarRef.current) {
      return 0;
    }
    const rect = volumeBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    // 获取点击或拖动的位置
    // 计算百分比位置
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
  // 禁止选中文本等默认行为
  e.preventDefault();
};

// 鼠标移动事件，拖动进度
export const handleMouseMove = (e, volumeBarRef, data, setData, setCoordsVolume, isDraggingVolume) => {
  let barCurrentVolume = updateProgress(e, volumeBarRef, data, setData); // 拖动时更新进度
  const rect = volumeBarRef.current.getBoundingClientRect();
  setCoordsVolume({
    x: e.clientX,
    y: e.clientY - rect.top,
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
    // await invoke('control_volume', { volume: barCurrentVolume/100 });
    const isMusic = player.checkIsMusic(data.audioSrc);
    let playFun = undefined;
    if (isMusic){
      playFun = data.music.current
    }else {
      playFun = data.video.current
    }
    playFun.setVolume(barCurrentVolume);
    setData(prevData => ({
      ...prevData,
      isPlaying: true,
      barCurrentVolume: barCurrentVolume
    }));
  }
  setIsDraggingVolume(false);
};


export const upVolume = (barCurrentVolume, setData) => {
  if (barCurrentVolume >= 100) {
    barCurrentVolume = 100;
  }else{
    barCurrentVolume = barCurrentVolume + 1;
  }
  localStorage.setItem('barCurrentVolume', JSON.stringify(barCurrentVolume));
  setData(prevData => ({
    ...prevData,
    barCurrentVolume: barCurrentVolume
  }));
}

export const downVolume = (barCurrentVolume, setData) => {
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
}