import utils from "../../common/utils"
import "./BarVolume.css"
import { useState, useEffect, useRef } from "react";

import {updateProgress, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, upVolume, downVolume} from "./BarVolumeFun/"


function BarPlayer(props) {
    const {data, setData} = props;
    const [isDragging, setIsDragging] = useState(false); // 是否正在拖动

    const volumeBarRef = useRef(null);

    return (
    <div className="container bar">
        <img className="left-bar" src="/img/最小音量.ico" onClick={() => downVolume(data.barCurrentVolume, setData)}></img>
        <div className="center-block-volume"
        ref={volumeBarRef}
        onClick={(e) => updateProgress(e, data, setData)}  // 点击时更新进度
        onMouseDown={(e) => handleMouseDown(e, volumeBarRef, setIsDragging, data, setData)}  // 按下时开始拖动
        onMouseMove={(e) => handleMouseMove(e, volumeBarRef, isDragging, data, setData)}  // 移动时更新进度
        onMouseUp={(e) => handleMouseUp(e, volumeBarRef, setIsDragging, data, setData)}      // 松开时结束拖动
        onMouseLeave={(e) => handleMouseLeave(e, volumeBarRef, isDragging, setIsDragging, data, setData)} // 离开时结束拖动
        >
        <div className="center-bar">
            {/* 进度条的填充部分 */}
            <div className="center-bar-rate" style={{ width: `${utils.calculatePercentage(data.barCurrentVolume, 100)}%` }}></div>
            <div className="center-bar-rate-end" style={{ width: `${100-utils.calculatePercentage(data.barCurrentVolume, 100)}%` }}></div>
            {/* 进度条上的小圆球 */}
            <div className="center-bar-ball" style={{ left: `${utils.calculatePercentage(data.barCurrentVolume, 100)}%` }}>
            </div>
        </div>
        </div>

        <img className="right-bar" src="/img/最大音量.ico" onClick={() => upVolume(data.barCurrentVolume, setData)}></img>
    </div>
  )
}

export default BarPlayer;