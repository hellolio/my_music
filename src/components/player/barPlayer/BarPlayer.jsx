import * as utils from "../../../common/utils"
import "./BarPlayer.css"
import { useState, useEffect, useRef } from "react";
import { listen } from '@tauri-apps/api/event';

import {updateProgress, handleMouseDown, handleMouseMove, handleMouseUp} from "./BarPlayerFun"


function BarPlayer(props) {
    const {data, setData} = props;

    const progressBarRef = useRef(null);

    const [coords, setCoords] = useState({ x: 0, y: 0, sec:0, visible: false });
    const [isDragging, setIsDragging] = useState(false);

    const [AB, setAB] = useState({
      isAB: -1,  // -1说明不是AB模式，0是AB模式并且当前是设置A，1是AB模式并且当前是设置B，2是AB模式并且当前是设置完成正在执行AB模式
      A: -1,
      B: -1
    });

    useEffect(() => {
      // 监听进度事件
      if (!isDragging) {
        const listenProgress = listen("player_progress", (event) => {
          const newProgress = event.payload / 1000;  // 获取进度（这里假设是一个数字）

          if (event.payload === -1) {
            // 更新进度
            setData(prevData => ({
              ...prevData,
              playerAlive: false,
              isPlaying: false,
              playState: -1,
              barCurrentProgressSec: 0
            }));
          } else {

            if (AB.isAB === 1 && AB.A != -1 && AB.B != -1){
              if (AB.B < newProgress || AB.A > newProgress){
                const isMusic = utils.isMusic(data.audioSrc);
                let playFun = undefined;
                if (isMusic){
                  playFun = data.music.current
                }else {
                  playFun = data.video.current
                }
                playFun.seek(AB.A, data.barCurrentVolume);
              }
            }

            // 计算百分比
            const newProgressP = newProgress / data.totalDuration;
            // 更新进度
              setData(prevData => ({
                ...prevData,
                isPlaying: true,
                playState: 1,
                barCurrentProgressSec: Math.round(newProgressP * data.totalDuration)
              }));
          }
        });
        // 清理监听器
        return () => {
          listenProgress.then((unlisten) => unlisten());  // 组件卸载时清理监听器
        }; 
      }
    }, [data, AB]);
    
    return (
    <div className="container bar progress">
        <div className={`left-bar-progress ${AB.isAB >=0 ? 'a': ''}`}
          onDoubleClick={() => {
            if (AB.isAB === -1){
              setAB(prev =>({
                ...prev,
                isAB:0,
                A: data.barCurrentProgressSec
              }));
            } else{
              setAB(prev =>({
                ...prev,
                isAB:-1
              }));
            }
          }
        }
        >{`${AB.isAB>=0 ?'A:' + utils.formatTime(AB.A): utils.formatTime(data.barCurrentProgressSec)}`}
        </div>
        <div className="center-block-progress"
        ref={progressBarRef}
        onClick={(e) => updateProgress(e, data, setData)}  // 点击时更新进度
        onMouseDown={(e) => {handleMouseDown(e, setIsDragging)}}
        onMouseMove={(e) => handleMouseMove(e, progressBarRef, data, setData, setCoords, isDragging)}  // 移动时更新进度
        onMouseUp={(e) => handleMouseUp(e, data, setData, coords, setCoords, isDragging, setIsDragging, AB, setAB)}      // 松开时结束拖动
        onMouseLeave={(e) => handleMouseUp(e, data, setData, coords, setCoords, isDragging, setIsDragging, AB, setAB)} // 离开时结束拖动
        >
          {coords.visible && (
            <div
              className="tooltip-progress"
              style={{ left: coords.x + 10, top: coords.y - 25 }}
            >
              进度：{utils.formatTime(coords.sec)}
            </div>
          )}

            <div className="center-bar">
                {/* 进度条的填充部分 */}
                <div className="center-bar-rate" style={{ width: `${utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}></div>
                <div className="center-bar-rate-end" style={{ width: `${100-utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}></div>
                {/* 进度条上的小圆球 */}
                <div className="center-bar-ball" style={{ left: `${utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}></div>
                <div className={`center-bar-ball-ab ${AB.isAB >=0 ? 'a': ''}`} style={{ left: `${utils.calculatePercentage(AB.A, data.totalDuration)}%` }}></div>
                <div className={`center-bar-ball-ab ${AB.isAB === 1 ? 'b': ''}`} style={{ left: `${utils.calculatePercentage(AB.B, data.totalDuration)}%` }}></div>
            </div>
        </div>

        <div className={`right-bar-progress ${AB.isAB ===1 ? 'b': ''}`}
          onDoubleClick={() => {
            if (AB.isAB === 0 && AB.A < data.barCurrentProgressSec){
              setAB(prev =>({
                ...prev,
                isAB:1,
                B: data.barCurrentProgressSec
              }));
            } else{
              setAB(prev =>({
                ...prev,
                isAB:-1
              }));
            }
          }}
        >{`${AB.isAB>=1 ?'B:' + utils.formatTime(AB.B): utils.formatTime(data.totalDuration)}`}
        </div>
    </div>
  )
}

export default BarPlayer;