import styles from "./CommonSetting.module.scss";
import ReactDOM from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';
import {saveSetting} from './CommonSettingFun'

import MyButton from "@/components/common/button/MyButton";

export default function CommonSetting({commonSetting, setCommonSetting, data, setData, panelRef, settingData, setSettingData, onClose}) {

    const [savePath, setSavePath] = useState("");
    const [selectedRemeber, setSelectedRemeber] = useState(false);
    const [selectedDongan, setSelectedDongan] = useState(false);

    const CommonSettingRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (commonSetting && CommonSettingRef.current && !CommonSettingRef.current.contains(event.target) &&
          panelRef.current && !panelRef.current.contains(event.target)) {
            setCommonSetting(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        // 清理函数
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [commonSetting, onClose, panelRef]);


    return ReactDOM.createPortal(
      <div id="lyricModal" className={`${styles.modal} ${commonSetting ? styles.visible : ''}`}
      >
        <div className={styles.modalContent} ref={CommonSettingRef}>
              <div className={`${styles.postControls}`}>
                <div className={styles.left}
                  onClick={() => setSelectedRemeber(!selectedRemeber)}
                >
                <input
                  type="checkbox"
                  checked={selectedRemeber}
                />
                  <label htmlFor="savePath" 
                    className={styles.savePathLabel}
                  >记住桌面
                  </label>
                </div>
              </div>  
              <div className={`${styles.postControls}`}>
                <div className={styles.left}
                  onClick={() => setSelectedDongan(!selectedDongan)}
                >
                <input
                  type="checkbox"
                  checked={selectedDongan}
                />
                  <label htmlFor="savePath" 
                    className={styles.savePathLabel}
                  >动感光波
                  </label>
                </div>
              </div>  

              <div className={`${styles.postControls}`}>
                <div className={`${styles.rightControls}`}>
                  <MyButton 
                    callFun={() => saveSetting(data, setData, settingData, setSettingData, savePath, selectedRemeber)}
                    msg={'应用'}
                    isConfirm={true}
                  />
                </div>
              </div>
          </div>
      </div>,
        document.body // 指定挂载点
    )
}