import { useState, useEffect } from "react";


import styles from "./MainWindow.module.scss";
import BtnPlayer from "@/components/player/btnPlayer/BtnPlayer";
import BarPlayer from "@/components/player/barPlayer/BarPlayer";
import BarVolume from "@/components/player/barVolume/BarVolume";
import Video from "@/components/displayer/video/Video";
import Music from "@/components/displayer/music/Music";
import { MyProvider} from "@/components/common/context/MyProvider";
import { WindowSetting } from "@/components/windowSetting/WindowSetting";


function MainWindow({data, setData, allSongList, setAllSongList, musicRef, videoRef, setIsDesktopMode}) {

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
    <MyProvider>
      <div 
        className={styles.myPlayer}
      >
        <div className={styles.windowSetting}>
          <WindowSetting 
            data={data}
            setData={setData}
            allSongList={allSongList}
            setAllSongList={setAllSongList}
            setIsDesktopMode={setIsDesktopMode}
          />
        </div>

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
            <BtnPlayer 
              data={data} 
              setData={setData}
              allSongList={allSongList}
              setAllSongList={setAllSongList}
              />
          </div>
    
          {/* 播放音量设置 */}
          <div className={`${styles.parent} ${styles.volumeBar}`}>
            <BarVolume data={data} setData={setData} />
          </div>
        </div>
      </div>
    </MyProvider>
  );
  
}

export default MainWindow;
