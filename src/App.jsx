import { useState, useEffect, useRef } from "react";

import "./App.css";
import BtnPlayer from "./components/player/btnPlayer/BtnPlayer";
import BarPlayer from "./components/player/barPlayer/BarPlayer";
import BarVolume from "./components/player/barVolume/BarVolume";
import Video from "./components/displayer/video/Video";
import Music from "./components/displayer/music/Music";


function App() {

  useEffect(() => {
    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    const handleKeyDown = (event) => {
      // 禁用 F5 和 Ctrl+R / Cmd+R
      if (
        event.key === 'F5' ||
        (event.key.toLowerCase() === 'r' && (event.ctrlKey || event.metaKey))
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const dataTmp = localStorage.getItem('data');
  const barCurrentVolume = localStorage.getItem('barCurrentVolume');
  const isSingleLoop = localStorage.getItem('isSingleLoop');

  const dataTmpParse = JSON.parse(dataTmp);
  const musicRef = useRef();
  const videoRef = useRef();

  const [data, setData] = useState(
    {
      id: 1,
      playlistId: dataTmp ? dataTmpParse.playlistId : 1,
      title: dataTmp ? dataTmpParse.title : null,
      author: null,
      isCollect: false,
      isFollow: false,
      lyrics: dataTmp ? dataTmpParse.lyrics : [],
      lyricsPath: dataTmp ? dataTmpParse.lyricsPath : null,
      audioSrc: dataTmp ? dataTmpParse.audioSrc : null,
      totalDuration: dataTmp ? dataTmpParse.totalDuration : 100,
      barCurrentProgressSec: 0,
      barCurrentVolume: barCurrentVolume ? JSON.parse(barCurrentVolume) : 30,
      isPlaying: true,
      playState: -1,   // -1是当前没有播放或者播放线程结束，0是播放结束，但线程未结束，1是正在播放
      isSingleLoop: isSingleLoop ? JSON.parse(isSingleLoop) : true,
      playerAlive: false,
      video: videoRef,
      music: musicRef,
      isMusic: true
    }
  );
  
  useEffect(() => {
    localStorage.setItem('data', JSON.stringify(data));
  }, [data]);

  // 切换到某个歌单
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (data.isMusic) {
      setCurrentIndex(0)
    } else {
      setCurrentIndex(1)
    }
  }, [data.isMusic]);


  return (
    <div className="my-player">
      <div className="display">
      <div className="play-slider-container">
        <div
          className="play-slider-wrapper"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          <div className="music">
            <Music ref={musicRef}  data={data} setData={setData} />
          </div>
          <div className="video">
            <Video  ref={videoRef} data={data} setData={setData} />
          </div>
        </div>
      </div>

      </div>

      <div className="player">
        {/* 播放进度设置 */}
        <div className="parent bar">
          <BarPlayer data={data} setData={setData}/>
        </div>

        {/* 播放按钮设置 */}
        <div className="parent btnPlayer">
          <BtnPlayer data={data} setData={setData}/>
        </div>

        {/* 播放音量设置 */}
        <div className="parent volumeBar">
          <BarVolume data={data} setData={setData}/>
        </div>

      </div>
    </div>
  );
}

export default App;
