
import { useState, useEffect, useRef } from "react";
import styles from "./BtnPlayer.module.scss";

import SongList from "../../songList/SongList";
import MyButton from "@/components/common/button/MyButton";

import {leftClick, togglePlayPause, rightClick, cycleClick, handleTogglePanel} from "./BtnPlayerFun"

function BtnPlayer(props) {
  const {data, setData} = props;

  // 歌单总列表
  const [musicListAllState, setMusicListAllState] = useState([]);

  useEffect(() => {
    if (data.playState===-1) {
      if (data.isSingleLoop) {
        togglePlayPause(data, setData);
      } else {
        rightClick(musicListAllState, data, setData);
      }
    } 
  }, [data.playState]);

  // 是否显示播放list
  const [showPanel, setShowPanel] = useState(false);

  const listBtnPlayerRef = useRef(null);

  const handleClosePanel = () => {
    setShowPanel(false);
  };
  return (
    <div 
      className={styles.containerBtnPlayer}
      ref={listBtnPlayerRef}
    >
      <MyButton 
        callFun={() => cycleClick(data, setData)}
        msg={data.isSingleLoop ? "①" : "↻"}
        isConfirm={true}
        style={styles.setting}
      />
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
        callFun={() => handleTogglePanel(setShowPanel)}
        msg={'≡'}
        isConfirm={true}
        style={styles.setting}
      />
      <SongList 
        data={data}
        setData={setData}
        visible={showPanel}
        onClose={handleClosePanel}
        songs={musicListAllState}
        setSongs={setMusicListAllState}
        listBtnPlayerRef={listBtnPlayerRef}
      />
    </div>
  );
  
};

export default BtnPlayer;
