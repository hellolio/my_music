import * as utils from "@/common/utils"
import styles from "./BarVolume.module.scss"
import { useState, useRef } from "react";

import {updateProgress, handleMouseDown, handleMouseMove, handleMouseUp, upVolume, downVolume} from "./BarVolumeFun/"


function BarPlayer(props) {
    const {data, setData} = props;
    const [isDraggingVolume, setIsDraggingVolume] = useState(false); // 是否正在拖动
    const [coordsVolume, setCoordsVolume] = useState({ x: 0, y: 0, volume:0, visible: false });

    const volumeBarRef = useRef(null);
    return (
      <div className={`${styles.container} ${styles.bar} ${styles.volume}`}>
        <img
          className={styles.leftBarVolume}
          src="/img/最小音量.ico"
          onClick={() => downVolume(data.barCurrentVolume, setData)}
        />
        <div
          className={styles.centerBlockVolume}
          ref={volumeBarRef}
          onClick={(e) => updateProgress(e, data, setData)}
          onMouseDown={(e) => { handleMouseDown(e, setIsDraggingVolume) }}
          onMouseMove={(e) =>
            handleMouseMove(
              e,
              volumeBarRef,
              data,
              setData,
              setCoordsVolume,
              isDraggingVolume
            )
          }
          onMouseUp={(e) =>
            handleMouseUp(
              e,
              data,
              setData,
              coordsVolume,
              setCoordsVolume,
              isDraggingVolume,
              setIsDraggingVolume
            )
          }
          onMouseLeave={(e) =>
            handleMouseUp(
              e,
              data,
              setData,
              coordsVolume,
              setCoordsVolume,
              isDraggingVolume,
              setIsDraggingVolume
            )
          }
        >
          {coordsVolume.visible && (
            <div
              className={styles.tooltipVolume}
              style={{ left: coordsVolume.x + 10, top: coordsVolume.y + 55 }}
            >
              音量：{coordsVolume.volume}%
            </div>
          )}
          <div className={styles.centerBar}>
            <div
              className={styles.centerBarRate}
              style={{
                width: `${utils.calculatePercentage(
                  data.barCurrentVolume,
                  100
                )}%`,
              }}
            ></div>
            <div
              className={styles.centerBarRateEnd}
              style={{
                width: `${
                  100 - utils.calculatePercentage(data.barCurrentVolume, 100)
                }%`,
              }}
            ></div>
            <div
              className={styles.centerBarBall}
              style={{
                left: `${utils.calculatePercentage(
                  data.barCurrentVolume,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>
        <img
          className={styles.rightBarVolume}
          src="/img/最大音量.ico"
          onClick={() => upVolume(data.barCurrentVolume, setData)}
        />
      </div>
    );
    
  }
export default BarPlayer;