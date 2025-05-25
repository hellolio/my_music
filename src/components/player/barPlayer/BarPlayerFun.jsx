import * as player from "../../../common/player"

// 计算并设置进度
export const updateProgress = (e, progressBarRef, data, setData) =>  {
    // 获取进度条容器的宽度
    let progressBarWidth = e.currentTarget.clientWidth;

    if (!progressBarRef.current) {
      return 0;
    }
    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    // 计算百分比位置
    let newProgress = Math.round((offsetX / progressBarWidth) * 100);
    let barCurrentProgressSec = Math.round((newProgress * data.totalDuration)/100);

    // 必须比最长时间少一点，否则播放会结束，无法重新控制进度（只能重新启动一个线程，但是太慢了）
    if (barCurrentProgressSec > data.totalDuration-1){
      barCurrentProgressSec = data.totalDuration-1;
    } else if (barCurrentProgressSec < 0){
      barCurrentProgressSec = 0;
    }
    return barCurrentProgressSec;
};

// 鼠标按下事件，开始拖动
export const handleMouseDown = (e, setIsDragging) => {
  setIsDragging(true);
  // 禁止选中文本等默认行为
  e.preventDefault();
};

// 鼠标移动事件，拖动进度
export const handleMouseMove = (e, progressBarRef, data, setData, setCoords, isDragging) => {
  let barCurrentProgressSec = updateProgress(e, progressBarRef, data, setData); // 拖动时更新进度
  const rect = progressBarRef.current.getBoundingClientRect();
  setCoords({
    x: e.clientX- rect.left,
    y: e.clientY - rect.top,
    sec: barCurrentProgressSec,
    visible: true,
  });

  if (isDragging){
    setData(prevData => ({
      ...prevData,
      barCurrentProgressSec: barCurrentProgressSec
    }));
  }

};

// 鼠标松开事件，结束拖动
export const handleMouseUp = async (e, data, setData, coords, setCoords, isDragging, setIsDragging, AB, setAB) => {
  let barCurrentProgressSec = coords.sec;

  setCoords((prev) => ({ ...prev, visible: false }));
  if (isDragging){
      const isMusic = player.checkIsMusic(data.audioSrc);
      let playFun = undefined;
      if (isMusic){
        playFun = data.music.current
      }else {
        playFun = data.video.current
      }
      playFun.seek(barCurrentProgressSec, data.barCurrentVolume);
  
      setData(prevData => ({
        ...prevData,
        isPlaying: true,
        barCurrentProgressSec: barCurrentProgressSec
      }));

  }
  setIsDragging(false);
};
