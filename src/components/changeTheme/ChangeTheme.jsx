import styles from "./ChangeTheme.module.scss";
import ReactDOM from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';
import {selectSavePath, saveSetting} from './ChangeThemeFun'

import MyButton from "@/components/common/button/MyButton";
import MyInput from "@/components/common/input/MyInput";

export default function ChangeTheme({changeTheme, setChangeTheme, data, setData, panelRef, settingData, setSettingData, onClose}) {

    const [savePath, setSavePath] = useState(settingData.coverImagePath);
    const [selected, setSelected] = useState(settingData.useMusicCover);

    const ChangeThemeRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (changeTheme && ChangeThemeRef.current && !ChangeThemeRef.current.contains(event.target) &&
          panelRef.current && !panelRef.current.contains(event.target)) {
            setChangeTheme(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        // 清理函数
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [changeTheme, onClose, panelRef]);


    return ReactDOM.createPortal(
      <div id="lyricModal" className={`${styles.modal} ${changeTheme ? styles.visible : ''}`}
      >
        <div className={styles.modalContent} ref={ChangeThemeRef}>
              <div className={`${styles.postControls}`}>
                {/* 左侧区域 */}
                <div className={`${styles.leftControls} ${styles.left}`}>
                  <MyButton 
                    callFun={() => selectSavePath(setSavePath)}
                    msg={'设置背景图片'}
                    isConfirm={true}
                  />
                  <MyInput 
                    type={'text'}
                    value={savePath}
                    setValue={setSavePath}
                    placeholder="输入路径"
                  />
                </div>
              </div>

              <div className={`${styles.postControls}`}>
                <div className={styles.left}
                  onClick={() => setSelected(!selected)}
                >
                <input
                  type="checkbox"
                  readOnly
                  checked={selected}
                  // onChange={() => setSelected(!selected)}
                />

                  <label htmlFor="savePath" 
                    className={styles.savePathLabel}
                  >将当前歌曲的专辑封面设置为背景
                  </label>
                  
                </div>
                <label htmlFor="" className={styles.savePathLabelblack}></label>

              </div>  

              <div className={`${styles.postControls}`}>
              <div className={`${styles.rightControls}`}>
                <MyButton 
                  callFun={() => saveSetting(data, setData, settingData, setSettingData, savePath, selected)}
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