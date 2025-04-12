import { invoke } from "@tauri-apps/api/tauri";

// 计算并设置进度
export const updateProgress = (e, volumeBarRef, data, setData) =>  {
    console.log("eeeee:",handleMouseUp);
    // 获取进度条容器的宽度
    let progressBarWidth = e.currentTarget.clientWidth;
    console.log("进度条容器的宽度:", progressBarWidth);

    const rect = volumeBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    // 获取点击或拖动的位置
    console.log("点击或拖动的位置:",offsetX)

    // 计算百分比位置
    let barCurrentVolume = Math.round((offsetX / progressBarWidth) * 100);
    console.log("计算百分比位置:", barCurrentVolume);
    if (barCurrentVolume <= 0) {
      barCurrentVolume = 0;
    }else if (barCurrentVolume >= 100) {
      barCurrentVolume = 100;
    }
    localStorage.setItem('barCurrentVolume', JSON.stringify(barCurrentVolume));

    return barCurrentVolume;
};

// 鼠标按下事件，开始拖动
export const handleMouseDown = (e, volumeBarRef, setIsDragging, data, setData) => {
  setIsDragging(true);
  let barCurrentVolume = updateProgress(e, volumeBarRef, data, setData); // 立即更新进度
  // 更新进度
  setData(prevData => ({
    ...prevData,
    barCurrentVolume: barCurrentVolume
  }));
  // 禁止选中文本等默认行为
  e.preventDefault();
};

// 鼠标移动事件，拖动进度
export const handleMouseMove = (e, volumeBarRef, isDragging, data, setData) => {
  if (isDragging) {
    let barCurrentVolume = updateProgress(e, volumeBarRef, data, setData); // 拖动时更新进度
    // 更新进度
    setData(prevData => ({
      ...prevData,
      barCurrentVolume: barCurrentVolume
    }));
  }
};

// 鼠标松开事件，结束拖动
export const handleMouseUp = async (e, volumeBarRef, setIsDragging, data, setData) => {
  setIsDragging(false);
  let barCurrentVolume = updateProgress(e, volumeBarRef, data, setData); // 拖动时更新进度
  await invoke('control_volume', { volume: barCurrentVolume/100 });

  setData(prevData => ({
    ...prevData,
    barCurrentVolume: barCurrentVolume
  }));
};

// 鼠标离开事件，结束拖动
export const handleMouseLeave = async (e, volumeBarRef, isDragging, setIsDragging, data, setData) => {
  if (isDragging) {
    setIsDragging(false);
    let barCurrentVolume = updateProgress(e, volumeBarRef, data, setData); // 拖动时更新进度
    await invoke('control_volume', { volume: barCurrentVolume/100 });

    setData(prevData => ({
        ...prevData,
        barCurrentVolume: barCurrentVolume
    }));
}
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