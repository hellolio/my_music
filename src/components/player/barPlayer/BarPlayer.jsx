import * as utils from "../../../common/utils"
import * as player from "../../../common/player"
import styles from "./BarPlayer.module.scss"
import { useState, useEffect, useRef } from "react";
import { listen } from '@tauri-apps/api/event';
import SettingButton from "@/components/common/settingButton/SettingButton";
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
                const isMusic = player.checkIsMusic(data.audioSrc);
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
      <div className={styles.gridContainer}>
            <SettingButton 
            className={styles.left}
              callDoubleFun={() => {
                if (AB.isAB === -1) {
                  setAB(prev => ({
                    ...prev,
                    isAB: 0,
                    A: data.barCurrentProgressSec,
                  }));
                } else {
                  setAB(prev => ({
                    ...prev,
                    isAB: -1,
                  }));
                }
              }}
              msg={`${AB.isAB >= 0 ? 'A:' + utils.formatTime(AB.A) : utils.formatTime(data.barCurrentProgressSec)}`}
              style={`${styles.leftBarProgress} ${AB.isAB >= 0 ? styles.leftBarProgressA : ''}`}
            />
          <div data-clickable
          className={styles.center}
          ref={progressBarRef}
          onClick={(e) => updateProgress(e, data, setData)}  // 点击时更新进度
          onMouseDown={(e) => { handleMouseDown(e, setIsDragging); }}
          onMouseMove={(e) => handleMouseMove(e, progressBarRef, data, setData, setCoords, isDragging)}  // 移动时更新进度
          onMouseUp={(e) => handleMouseUp(e, data, setData, coords, setCoords, isDragging, setIsDragging, AB, setAB)}  // 松开时结束拖动
          onMouseLeave={(e) => handleMouseUp(e, data, setData, coords, setCoords, isDragging, setIsDragging, AB, setAB)} // 离开时结束拖动
        >
          {coords.visible && (
            <div
              className={styles.tooltipProgress}
              style={{ left: `${coords.x}px`, top: `${coords.y - 30}px` }}
            >
              进度：{utils.formatTime(coords.sec)}
            </div>
           )} 
    
          <div className={styles.centerBar}>
            {/* 进度条的填充部分 */}
            <div className={styles.centerBarRate} style={{ width: `${utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}></div>
            <div className={styles.centerBarRateEnd} style={{ width: `${100 - utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}></div>
            {/* 进度条上的小圆球 */}
            <div className={styles.centerBarBall} style={{ left: `${utils.calculatePercentage(data.barCurrentProgressSec, data.totalDuration)}%` }}></div>
            <div className={`${styles.centerBarBallAb} ${AB.isAB >= 0 ? styles.centerBarBallAbA : ''}`} style={{ left: `${utils.calculatePercentage(AB.A, data.totalDuration)}%` }}></div>
            <div className={`${styles.centerBarBallAb} ${AB.isAB === 1 ? styles.centerBarBallAbB : ''}`} style={{ left: `${utils.calculatePercentage(AB.B, data.totalDuration)}%` }}></div>
          </div>
        </div>
          <SettingButton 
          className={styles.right}
          callDoubleFun={() => {
            if (AB.isAB === 0 && AB.A < data.barCurrentProgressSec) {
              setAB(prev => ({
                ...prev,
                isAB: 1,
                B: data.barCurrentProgressSec,
              }));
            } else {
              setAB(prev => ({
                ...prev,
                isAB: -1,
              }));
            }
          }}
          msg={`${AB.isAB >= 1 ? 'B:' + utils.formatTime(AB.B) : utils.formatTime(data.totalDuration)}`}
          style={`${styles.rightBarProgress} ${AB.isAB === 1 ? styles.rightBarProgressB : ''}`}
        />
      </div>
    );
    
}

export default BarPlayer;