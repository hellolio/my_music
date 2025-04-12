import utils from "../../common/utils"
import "./BarPlayer.css"
import { useState, useEffect, useRef } from "react";
import { listen } from '@tauri-apps/api/event';

import {updateProgress, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave} from "./BarPlayerFun/"


function BarPlayer(props) {
    const {data, setData} = props;
    const [isDragging, setIsDragging] = useState(false); // 是否正在拖动

    const progressBarRef = useRef(null);

    useEffect(() => {
        console.log("启动监听:", data);
        // 监听进度事件
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
    }, [data]);
    
    return (
    <div className="container bar">
        <div className="left-bar">{utils.formatTime(data.barCurrentProgressSec)}</div>
            <div className="center-block"
            ref={progressBarRef}
            onClick={(e) => updateProgress(e, data, setData)}  // 点击时更新进度
            onMouseDown={(e) => handleMouseDown(e, progressBarRef, setIsDragging, data, setData)}  // 按下时开始拖动
            onMouseMove={(e) => handleMouseMove(e, progressBarRef, isDragging, data, setData)}  // 移动时更新进度
            onMouseUp={(e) => handleMouseUp(e, progressBarRef, setIsDragging, data, setData)}      // 松开时结束拖动
            onMouseLeave={(e) => handleMouseLeave(e, progressBarRef, isDragging, setIsDragging, data, setData)} // 离开时结束拖动
            >
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