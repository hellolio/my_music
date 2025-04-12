import { useState, useEffect } from "react";


import "./App.css";
import BtnPlayer from "./components/btnPlayer/BtnPlayer/";
import BarPlayer from "./components/barPlayer/BarPlayer";
import BarVolume from "./components/barVolume/BarVolume";
import LyricsPlayer from "./components/lyricsPlayer/LyricsPlayer";
import TitlePlayer from "./components/titlePlayer/TitlePlayer";


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

  const barCurrentVolume = localStorage.getItem('barCurrentVolume');
  const isSingleLoop = localStorage.getItem('isSingleLoop');
  const [data, setData] = useState(
    {
      id: 1,
      title: null,
      author: null,
      isCollect: false,
      isFollow: false,
      lyrics: [],
      lyricsPath: null,
      audioSrc: null,
      totalDuration: 100,
      barCurrentProgressSec: 0,
      barCurrentVolume: barCurrentVolume ? JSON.parse(barCurrentVolume) : 10,
      isPlaying: true,
      playState: -1,   // -1是当前没有播放或者播放线程结束，0是播放结束，但线程未结束，1是正在播放
      isSingleLoop: isSingleLoop ? JSON.parse(isSingleLoop) : true,
      playerAlive: false
    }
  );


  return (
    <div className="my-music">

      {/* 歌曲抬头设置 */}
      <div className="parent title">
        <TitlePlayer data={data} setData={setData}/>
      </div>

      {/* 歌词区设置 */}
      <div className="parent lyrics">
        <LyricsPlayer data={data} setData={setData}/>
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
