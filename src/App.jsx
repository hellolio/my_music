import { useState, useEffect, useRef } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { motion } from "framer-motion";

import MainWindow from "@/components/mainWindow/MainWindow";
import LyricBar from "@/components/lyricBar/LyricBar";
import styles from "./App.module.scss";
const appWindow = getCurrentWebviewWindow()

function App() {
  const ref = useRef(null);
  const musicRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseDown = (e) => {
      const target = e.target;

      // 忽略按钮、输入框、链接等
      if (
        ["BUTTON", "INPUT", "TEXTAREA", "A", "SELECT", "LI"].includes(
          target.tagName
        ) ||
        target.closest("[data-no-drag], [data-clickable]")
      ) {
        return;
      }
      // 检查是否显式设置了 click 事件
      const hasClickHandler =
        typeof el.onclick === "function" ||
        el.getAttribute("role") === "button";
      if (hasClickHandler) return true;

      appWindow.startDragging();
    };
    el.addEventListener("mousedown", onMouseDown);

    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    const handleKeyDown = (event) => {
      // 禁用 F5 和 Ctrl+R / Cmd+R
      if (
        event.key === "F5" ||
        (event.key.toLowerCase() === "r" && (event.ctrlKey || event.metaKey))
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      el.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const dataTmp = localStorage.getItem("data");
  const dataTmpParse = JSON.parse(dataTmp);

  const [data, setData] = useState({
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
    barCurrentVolume: dataTmp ? dataTmpParse.barCurrentVolume : 30,
    isPlaying: false,
    playState: -1, // -1是当前没有播放或者播放线程结束，0是播放结束，但线程未结束，1是正在播放
    isSingleLoop: dataTmp ? dataTmpParse.isSingleLoop : true,
    video: videoRef,
    music: musicRef,
    isMusic: true,
  });

  useEffect(() => {
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  // 所有歌单list
  const [allSongList, setAllSongList] = useState([]);

  const [isDesktopMode, setIsDesktopMode] = useState(false);

  return (
    <div id="app">
      <div
        className={`${styles.resizeHandle} ${styles.resizeleft}`}
        data-direction="w"
      ></div>
      <div
        className={`${styles.resizeHandle} ${styles.resizeright}`}
        data-direction="e"
      ></div>
      <div
        className={`${styles.resizeHandle} ${styles.resizetop}`}
        data-direction="n"
      ></div>
      <div
        className={`${styles.resizeHandle} ${styles.resizebottom}`}
        data-direction="s"
      ></div>

      <div ref={ref} style={{ position: "relative" }}>
        {/* MainWindow 显示时可见 */}
        <motion.div
          initial={false}
          animate={{
            opacity: isDesktopMode ? 0 : 1,
            pointerEvents: isDesktopMode ? "none" : "auto",
            scale: isDesktopMode ? 0.98 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <MainWindow
            data={data}
            setData={setData}
            allSongList={allSongList}
            setAllSongList={setAllSongList}
            musicRef={musicRef}
            videoRef={videoRef}
            setIsDesktopMode={setIsDesktopMode}
          />
        </motion.div>

        {/* LyricBar 显示时可见 */}
        <motion.div
          initial={false}
          animate={{
            opacity: isDesktopMode ? 1 : 0,
            pointerEvents: isDesktopMode ? "auto" : "none",
            scale: isDesktopMode ? 1 : 0.98,
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <LyricBar
            data={data}
            setData={setData}
            allSongList={allSongList}
            setAllSongList={setAllSongList}
            isDesktopMode={isDesktopMode}
            setIsDesktopMode={setIsDesktopMode}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default App;
