import { useState, useEffect, useRef } from "react";
import { appWindow, PhysicalPosition  } from '@tauri-apps/api/window';

import styles from "./App.module.scss";
import BtnPlayer from "./components/player/btnPlayer/BtnPlayer";
import BarPlayer from "./components/player/barPlayer/BarPlayer";
import BarVolume from "./components/player/barVolume/BarVolume";
import Video from "./components/displayer/video/Video";
import Music from "./components/displayer/music/Music";
import { SettingList } from "./components/settingList/SettingList";
import SplitRow from "./components/common/splitRow/SplitRow";
import MyButton from "@/components/common/button/MyButton";


function App() {
  const ref = useRef(null);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseDown = (e) => {
      const target = e.target;

      // 忽略按钮、输入框、链接等
      if (
        ['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'SELECT', 'IMG', 'LI'].includes(target.tagName) ||
        target.closest('[data-no-drag]')
      ) {
        return;
      }
      // 检查是否显式设置了 click 事件
      const hasClickHandler = typeof el.onclick === 'function' || el.getAttribute('role') === 'button';
      if (hasClickHandler) return true;

      appWindow.startDragging();
    };
    el.addEventListener('mousedown', onMouseDown);


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
      el.removeEventListener('mousedown', onMouseDown);
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
      coverImagePath: dataTmp ? dataTmpParse.coverImagePath : null,
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


  const settinglistRef = useRef(null);

  const [showSetting, setShowSetting] = useState(false);

  const handleClosePanel = () => {
    setShowSetting(false);
  };

  const minWindow = () =>{
    appWindow.minimize();
  }
  const maxWindow = () =>{
    appWindow.toggleMaximize();
  }
  const closeWindow = () =>{
    appWindow.close();
  }

  return (
    <div 
      className={styles.myPlayer}
      ref={ref}
    >
      <div id="drag-container"
        className={styles.window}>
        <SplitRow
          left={
            <div ref={settinglistRef}>
              <MyButton 
                callFun={() => setShowSetting(!showSetting)}
                msg={'⚙'}
                isConfirm={true}
                style={styles.setting}
              />
              <MyButton 
                callFun={() => {alert("开发中")}}
                msg={'👕'}
                isConfirm={true}
                style={styles.setting}
              />
              <MyButton 
                callFun={() => {alert("暂未开发")}}
                msg={'💡'}
                isConfirm={true}
                style={styles.setting}
              />
            </div>
          }
          right={
            <div className={styles.windowControls}>
              <MyButton 
                callFun={() => {alert("桌面模式暂未开发")}}
                msg={'↬'}
                isConfirm={true}
                style={styles.setting}
              />
              <MyButton 
                callFun={() => minWindow()}
                msg={'-'}
                isConfirm={true}
                style={styles.setting}
              />
              <MyButton 
                callFun={() => maxWindow()}
                msg={'□'}
                isConfirm={true}
                style={styles.setting}
              />
              <MyButton 
                callFun={() => closeWindow()}
                msg={'×'}
                isConfirm={true}
                style={styles.setting}
              />
          </div>
          }
        />
      </div>

      <SettingList
        visible={showSetting}
        onClose={handleClosePanel}
        settinglistRef={settinglistRef}
        data={data}
        setData={setData}
      />
      
      <div className={styles.display}>
        <div className={styles.playSliderContainer}>
          <div
            className={styles.playSliderWrapper}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            <div className={styles.music}>
              <Music ref={musicRef} data={data} setData={setData} />
            </div>
            <div className={styles.video}>
              <Video ref={videoRef} data={data} setData={setData} />
            </div>
          </div>
        </div>
      </div>
  
      <div className={styles.player}>
        {/* 播放进度设置 */}
        <div className={`${styles.parent} ${styles.bar}`}>
          <BarPlayer data={data} setData={setData} />
        </div>
  
        {/* 播放按钮设置 */}
        <div className={`${styles.parent} ${styles.btnPlayer}`}>
          <BtnPlayer data={data} setData={setData} />
        </div>
  
        {/* 播放音量设置 */}
        <div className={`${styles.parent} ${styles.volumeBar}`}>
          <BarVolume data={data} setData={setData} />
        </div>
      </div>
    </div>
  );
  
}

export default App;
