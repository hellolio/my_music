import { invoke } from "@tauri-apps/api/tauri";

import styles from './LyricBar.module.scss';
import { useState, useEffect, useRef } from "react";
import { appWindow, PhysicalSize  } from '@tauri-apps/api/window';
import * as utils from "@/common/utils";
import * as player from "@/common/player"

import MyButton from "@/components/common/button/MyButton";

export default function LyricBar({ data, setData, allSongList, setAllSongList, isDesktopMode, setIsDesktopMode }) {
  const [hovered, setHovered] = useState(false);
  const resizeWindow = async (width, height) => {
    await appWindow.setSize(new PhysicalSize(width, height));
  };

  const setIsDesktopModeBackend = async (isDesktopMode) => {
    await invoke('set_is_desktop_mode', { isDesktopMode: isDesktopMode });
  };

  const setAlwaysOnTop = async (isDesktopMode) => {
    await invoke('set_always_on_top', { windowOnTop: isDesktopMode });
  };

  useEffect(() => {
    setIsDesktopModeBackend(isDesktopMode);
    setAlwaysOnTop(isDesktopMode);
    if (isDesktopMode){
      resizeWindow(500, 100);
    } else {
      let _ = utils.readWindowState().then(result => {
        resizeWindow(result.window_width, result.window_height);
      });
    }
  }, [isDesktopMode]);

  const lyricRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

    // 当前高亮行索引
    const [currentLyric, setCurrentLyric] = useState("aaa");

    // 根据时间更新高亮行
    useEffect(() => {
      if (!data.lyrics.length) {
        setCurrentLyric("暂无歌词")
      }else {
        // 找到第一个时间超过 barCurrentProgressSec 的索引
        const index = data.lyrics.findIndex((e) => e.time > data.barCurrentProgressSec);
        setCurrentLyric(`${data.lyrics[index].text}`)

        const el = lyricRef.current;
        if (el && el.scrollWidth > el.clientWidth) {
          setShouldScroll(true);
        } else {
          setShouldScroll(false);
        }
      }

  }, [data.barCurrentProgressSec]);

  return (
    <div
      className={`${styles.lyricBar}}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        id="myPlayer"
        className={`${styles.lyricInfo} ${hovered ? styles.active : ''}`}
      >
        <span className={styles.lyricTitle}>{data.title}</span>
        <span ref={lyricRef} className={`${styles.lyricText} ${shouldScroll ? styles.scroll : ''}`}>{currentLyric}</span>
      </div>

      {hovered && (
        <div className={styles.controls}>
            <MyButton 
              callFun={() => player.leftClick(data, setData, allSongList)}
              msg={'<<'}
              isConfirm={true}
              style={styles.setting}
            />
            <MyButton 
              callFun={() => player.togglePlayPause(data, setData)} 
              msg={data.isPlaying ? '||': '▶'}
              isConfirm={true}
              style={styles.setting}
            />
            <MyButton 
              callFun={() => player.rightClick(data, setData, allSongList)}
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
