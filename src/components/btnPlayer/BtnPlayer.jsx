
import { useState, useEffect, useRef } from "react";
import "./BtnPlayer.css";

import SongList from "../songList/SongList";

import {leftClick, togglePlayPause, rightClick, cycleClick, handleTogglePanel} from "./BtnPlayerFun/"

function BtnPlayer(props) {
  const {data, setData} = props;

  // 歌单总列表
  const [musicListAllState, setMusicListAllState] = useState([]);

  useEffect(() => {
    if (data.playState===0) {
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
    <div>
      <div className="parent btnPlayer">
        <div className="container btnPlayer">
          <img className="cycle-btnPlayer"
           src={data.isSingleLoop? "/img/单曲循环.ico" : "/img/列表循环.ico"}
           alt="cycle" onClick={() => cycleClick(data, setData)} />
          <img className="left-btnPlayer" src="/img/上一曲.ico" alt="Add" onClick={() => leftClick(musicListAllState, data, setData)} />
          <div className="center-block">
            <img 
              className="center-btnPlayer"
              src={data.isPlaying ? "/img/暂停.ico" : "/img/播放.ico"} 
              alt="Change"
              onClick={() => togglePlayPause(data, setData)} 
            />
          </div>

          <img className="right-btnPlayer" src="/img/下一曲.ico" alt="Reduce" onClick={() => rightClick(musicListAllState, data, setData)} />
          <img className="list-btnPlayer" ref={listBtnPlayerRef} src="/img/播放列表.ico" alt="Reduce" onClick={() => handleTogglePanel(setShowPanel)} />
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
      </div>
    </div>
  );
};

export default BtnPlayer;
