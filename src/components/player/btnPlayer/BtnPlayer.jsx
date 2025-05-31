
import { useState, useRef } from "react";
import styles from "./BtnPlayer.module.scss";
import * as player from "@/common/player"

import SongList from "../../songList/SongList";
import SettingButton from "@/components/common/settingButton/SettingButton";
import ModalComFloat from "@/components/common/modalComFloat/ModalComFloat";


function BtnPlayer({data, setData, allSongList, setAllSongList} ) {
  const listBtnPlayerRef = useRef(null);


  const [showSongList, setShowSongList] = useState(false);

  return (
    <div 
      className={styles.containerBtnPlayer}
      ref={listBtnPlayerRef}
    >
      <SettingButton 
        callFun={() => player.cycleClick(data, setData)}
        msg={data.isSingleLoop ? "①" : "↻"}
      />
      <SettingButton 
        callFun={() => player.leftClick(data, setData, allSongList)}
        msg={'<<'}
      />
      <SettingButton 
        callFun={() => player.togglePlayPause(data, setData)} 
        msg={data.isPlaying ? '||': '▶'}
      />
      <SettingButton 
        callFun={() => player.rightClick(data, setData, allSongList)}
        msg={'>>'}
      />
      <SettingButton 
        callFun={() => setShowSongList(!showSongList)}
        msg={'≡'}
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
