import { useState } from 'react';
import styles from './LyricBar.module.scss';

import MyButton from "@/components/common/button/MyButton";

export default function LyricBar({ data, setData, allSongList, setAllSongList, setIsDesktopMode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={styles.lyricBar}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.lyricText}>{"我曾经跨过山和大海，也穿过人山人海"}</div>

      {hovered && (
        <div className={styles.controls}>
          <MyButton 
            callFun={() => leftClick(musicListAllState, data, setData)}
            msg={'<<'}
            isConfirm={true}
            style={styles.setting}
          />
          <MyButton 
            callFun={() => togglePlayPause(data, setData)} 
            msg={data.isPlaying ? '||': '▶'}
            isConfirm={true}
            style={styles.setting}
          />
          <MyButton 
            callFun={() => rightClick(musicListAllState, data, setData)}
            msg={'>>'}
            isConfirm={true}
            style={styles.setting}
          />
          <MyButton 
            callFun={() => setIsDesktopMode(false)}
            msg={'◱'}
            isConfirm={true}
            style={styles.setting}
          />
        </div>
      )}
    </div>
  );
}
