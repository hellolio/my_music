import utils from "../../common/utils"
import "./BarVolume.css"
import { useState, useRef } from "react";

import {updateProgress, handleMouseDown, handleMouseMove, handleMouseUp, upVolume, downVolume} from "./BarVolumeFun/"


function BarPlayer(props) {
    const {data, setData} = props;
    const [isDraggingVolume, setIsDraggingVolume] = useState(false); // 是否正在拖动
    const [coordsVolume, setCoordsVolume] = useState({ x: 0, y: 0, volume:0, visible: false });

    const volumeBarRef = useRef(null);

    return (
    <div className="container bar volume">
        <img className="left-bar-volume" src="/img/最小音量.ico" onClick={() => downVolume(data.barCurrentVolume, setData)}></img>
        <div className="center-block-volume"
        ref={volumeBarRef}
        onClick={(e) => updateProgress(e, data, setData)}  // 点击时更新进度
        onMouseDown={(e) => {handleMouseDown(e, setIsDraggingVolume)}}
        onMouseMove={(e) => handleMouseMove(e, volumeBarRef, data, setData, setCoordsVolume, isDraggingVolume)}  // 移动时更新进度
        onMouseUp={(e) => handleMouseUp(e, data, setData, coordsVolume, setCoordsVolume, isDraggingVolume, setIsDraggingVolume)}      // 松开时结束拖动
        onMouseLeave={(e) => handleMouseUp(e, data, setData, coordsVolume, setCoordsVolume, isDraggingVolume, setIsDraggingVolume)} // 离开时结束拖动
        >
        {coordsVolume.visible && (
            <div
              className="tooltip-volume"
              style={{ left: coordsVolume.x + 10, top: coordsVolume.y + 75 }}
            >
              音量：{coordsVolume.volume}%
            </div>
        )}
        <div className="center-bar">
            {/* 进度条的填充部分 */}
            <div className="center-bar-rate" style={{ width: `${utils.calculatePercentage(data.barCurrentVolume, 100)}%` }}></div>
            <div className="center-bar-rate-end" style={{ width: `${100-utils.calculatePercentage(data.barCurrentVolume, 100)}%` }}></div>
            {/* 进度条上的小圆球 */}
            <div className="center-bar-ball" style={{ left: `${utils.calculatePercentage(data.barCurrentVolume, 100)}%` }}>
            </div>
        </div>
        </div>

        <img className="right-bar-volume" src="/img/最大音量.ico" onClick={() => upVolume(data.barCurrentVolume, setData)}></img>
    </div>
  )
}

export default BarPlayer;