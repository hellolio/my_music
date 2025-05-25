import * as utils from "@/common/utils"
import styles from "./BarVolume.module.scss"
import { useState, useRef } from "react";
import SettingButton from "@/components/common/settingButton/SettingButton";
import SplitRow from "@/components/common/splitRow/SplitRow";
import {updateProgress, handleMouseDown, handleMouseMove, handleMouseUp, upVolume, downVolume} from "./BarVolumeFun/"


function BarPlayer(props) {
    const {data, setData} = props;
    const [isDraggingVolume, setIsDraggingVolume] = useState(false); // 是否正在拖动
    const [coordsVolume, setCoordsVolume] = useState({ x: 0, y: 0, volume:0, visible: false });

    const volumeBarRef = useRef(null);
    return (
<SplitRow
       gridCols={"1fr 5vw 1fr"}
       left={
        <SettingButton 
          callFun={() => downVolume(data.barCurrentVolume, setData)}
          msg={'🔈'}
        />
       }
       center={<div data-clickable
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
              style={{ left: `${coordsVolume.x +  20}px`, top: `${coordsVolume.y - 20}px` }}
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
        </div>}
       right={
        <SettingButton 
          callFun={() => upVolume(data.barCurrentVolume, setData)}
          msg={'🔊'}
        />
       }
        />
    );
    
  }
export default BarPlayer;