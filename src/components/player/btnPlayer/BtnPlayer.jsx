
import { useState, useEffect, useRef } from "react";
import styles from "./BtnPlayer.module.scss";

import SongList from "../../songList/SongList";
import MyButton from "@/components/common/button/MyButton";
import ModalCom from "@/components/common/modalCom/ModalCom";

import {leftClick, togglePlayPause, rightClick, cycleClick} from "./BtnPlayerFun"

function BtnPlayer(props) {
  const {data, setData, allSongList, setAllSongList} = props;

  useEffect(() => {
    if (data.playState===-1) {
      if (data.isSingleLoop) {
        togglePlayPause(data, setData);
      } else if (allSongList.length > 0){
        rightClick(data, setData, allSongList);
      }
    } 
  }, [data.playState]);

  // 是否显示播放list
  const [showSongList, setShowSongList] = useState(false);

  const listBtnPlayerRef = useRef(null);

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
        callFun={() => leftClick(data, setData, allSongList)}
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
        callFun={() => rightClick(data, setData, allSongList)}
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
      <SongList 
        data={data}
        setData={setData}
        allSongList={allSongList}
        setAllSongList={setAllSongList}
        visible={showSongList}
        onClose={() => {setShowSongList(false)}}
        listBtnPlayerRef={listBtnPlayerRef}
      />

              {/* <ModalCom
                visible={showSongList}
                setVisible={setShowSongList}
                parentRef={listBtnPlayerRef}
                style={styles.songList}
                children={
                  
                  <div>aaa</div>
                }
              /> */}

    </div>
  );
  
};

export default BtnPlayer;
