
import { useState, useEffect, useRef } from "react";
import styles from "./BtnPlayer.module.scss";
import * as player from "@/common/player"

import SongList from "../../songList/SongList";
import MyButton from "@/components/common/button/MyButton";
import ModalComFloat from "@/components/common/modalComFloat/ModalComFloat";

// import {leftClick, togglePlayPause, rightClick, cycleClick} from "./BtnPlayerFun"

function BtnPlayer(props) {
  const {data, setData, allSongList, setAllSongList} = props;
  const listBtnPlayerRef = useRef(null);

  useEffect(() => {
    if (data.playState===-1) {
      if (data.isSingleLoop) {
        player.togglePlayPause(data, setData);
      } else if (allSongList.length > 0){
        player.rightClick(data, setData, allSongList);
      }
    } 
  }, [data.playState]);

  // 是否显示播放list
  const [showSongList, setShowSongList] = useState(false);


  return (
    <div 
      className={styles.containerBtnPlayer}
      ref={listBtnPlayerRef}
    >
      <MyButton 
        callFun={() => player.cycleClick(data, setData)}
        msg={data.isSingleLoop ? "①" : "↻"}
        isConfirm={true}
        style={styles.setting}
      />
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
        callFun={() => setShowSongList(!showSongList)}
        msg={'≡'}
        isConfirm={true}
        style={styles.setting}
      />

      <ModalComFloat 
        visible={showSongList}
        setVisible={setShowSongList}
        panelRef={listBtnPlayerRef}
        children={
          <SongList 
            data={data}
            setData={setData}
            allSongList={allSongList}
            setAllSongList={setAllSongList}
          />
        }
      />
    </div>
  );
  
};

export default BtnPlayer;
