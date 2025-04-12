import utils from "../../common/utils"
import "./BarPlayer.css"
import { useState, useEffect, useRef } from "react";
import { listen } from '@tauri-apps/api/event';

import {updateProgress, handleMouseDown, handleMouseMove, handleMouseUp} from "./BarPlayerFun/"


function BarPlayer(props) {
    const {data, setData} = props;

    const progressBarRef = useRef(null);

    const [coords, setCoords] = useState({ x: 0, y: 0, sec:0, visible: false });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
      // 监听进度事件
      if (!isDragging) {
        // console.log("启动监听:", data);
        const listenProgress = listen("player_progress", (event) => {
          const newProgress = event.payload;  // 获取进度（这里假设是一个数字）
          if (newProgress === -1) {
            // 更新进度
            setData(prevData => ({
              ...prevData,
              playerAlive: false,
              isPlaying: false,
              playState: -1,
              barCurrentProgressSec: 0
            }));
          } else if (newProgress>=data.totalDuration*10){
            // 更新进度
            setData(prevData => ({
              ...prevData,
              isPlaying: false,
              playState: 0,
              barCurrentProgressSec: data.totalDuration
            }));
          } else {
            // 计算百分比
            const newProgressP = (newProgress / data.totalDuration) * 10;
            // 更新进度
              setData(prevData => ({
                ...prevData,
                isPlaying: true,
                playState: 1,
                barCurrentProgressSec: Math.round((newProgressP * data.totalDuration)/100)
              }));
          }
        });
        // 清理监听器
        return () => {
          listenProgress.then((unlisten) => unlisten());  // 组件卸载时清理监听器
        }; 
      }
    }, [data]);
    
    return (
    <div className="container bar progress">
        <div className="left-bar">{utils.formatTime(data.barCurrentProgressSec)}</div>
        <div className="center-block"
        ref={progressBarRef}
        onClick={(e) => updateProgress(e, data, setData)}  // 点击时更新进度
        onMouseDown={(e) => {handleMouseDown(e, setIsDragging)}}
        onMouseMove={(e) => handleMouseMove(e, progressBarRef, data, setData, setCoords, isDragging)}  // 移动时更新进度
        onMouseUp={(e) => handleMouseUp(e, data, setData, coords, setCoords, isDragging, setIsDragging)}      // 松开时结束拖动
        onMouseLeave={(e) => handleMouseUp(e, data, setData, coords, setCoords, isDragging, setIsDragging)} // 离开时结束拖动
        >
          {coords.visible && (
            <div
              className="tooltip"
              style={{ left: coords.x + 10, top: coords.y + 10 }}
            >
              进度：{utils.formatTime(coords.sec)}
            </div>
          )}

            <div className="center-bar">
                {/* 进度条的填充部分 */}
                <div className="center-bar-rate" style={{ width: `${utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}></div>
                <div className="center-bar-rate-end" style={{ width: `${100-utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}></div>
                {/* 进度条上的小圆球 */}
                <div className="center-bar-ball" style={{ left: `${utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}>
                </div>
            </div>
        </div>

        <div className="right-bar">{utils.formatTime(data.totalDuration)}</div>
    </div>
  )
}

export default BarPlayer;