import * as player from "../../../common/player";

// 计算并设置进度
export const updateProgress = (e, progressBarRef, data, setData) => {
  let progressBarWidth = e.currentTarget.clientWidth;

  if (!progressBarRef.current) {
    return 0;
  }
  const rect = progressBarRef.current.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;

  let newProgress = Math.round((offsetX / progressBarWidth) * 100);
  let barCurrentProgressSec = Math.round(
    (newProgress * data.totalDuration) / 100
  );

  if (barCurrentProgressSec > data.totalDuration - 1) {
    barCurrentProgressSec = data.totalDuration - 1;
  } else if (barCurrentProgressSec < 0) {
    barCurrentProgressSec = 0;
  }
  return barCurrentProgressSec;
};

// 鼠标按下事件，开始拖动
export const handleMouseDown = (e, setIsDragging) => {
  setIsDragging(true);

  e.preventDefault();
};

// 鼠标移动事件，拖动进度
export const handleMouseMove = (
  e,
  progressBarRef,
  data,
  setData,
  setCoords,
  isDragging
) => {
  if (data.audioSrc === null || data.audioSrc === undefined) {
    return;
  }

  let barCurrentProgressSec = updateProgress(e, progressBarRef, data, setData);
  const rect = progressBarRef.current.getBoundingClientRect();
  setCoords({
    x: e.clientX,
    y: e.clientY,
    sec: barCurrentProgressSec,
    visible: true,
  });

  if (isDragging) {
    setData((prevData) => ({
      ...prevData,
      barCurrentProgressSec: barCurrentProgressSec,
    }));
  }
};

// 鼠标松开事件，结束拖动
export const handleMouseUp = async (
  e,
  data,
  setData,
  coords,
  setCoords,
  isDragging,
  setIsDragging
) => {
  let barCurrentProgressSec = coords.sec;
  if (data.audioSrc === null || data.audioSrc === undefined) {
    return;
  }

  setCoords((prev) => ({ ...prev, visible: false }));
  if (isDragging) {
    const isMusic = player.checkIsMusic(data.audioSrc);
    let playFun = undefined;
    if (isMusic) {
      playFun = data.music.current;
    } else {
      playFun = data.video.current;
    }
    if (data.isPlaying) {
      playFun.seek(barCurrentProgressSec, data.barCurrentVolume);
    } else {
      let _ = await playFun.play(
        data.playlistId,
        data.audioSrc,
        data.totalDuration,
        barCurrentProgressSec,
        data.barCurrentVolume
      );
    }

    setData((prevData) => ({
      ...prevData,
      isPlaying: true,
      barCurrentProgressSec: barCurrentProgressSec,
    }));
  }
  setIsDragging(false);
};
