import React, { useEffect, useRef, useState } from 'react';
import styles from "./SettingList.module.scss";

import FindLyrics from '../findLyrics/FindLyrics';
import ChangeTheme from '../changeTheme/ChangeTheme';
import CommonSetting from '../commonSetting/CommonSetting';

export const SettingList = ({visible, onClose, settinglistRef, data, setData, settingData, setSettingData}) => {

    const panelRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (visible && panelRef.current && !panelRef.current.contains(event.target) &&
              settinglistRef.current && !settinglistRef.current.contains(event.target)) {
            onClose(); // 点击外面关闭
          }
        };
      
        document.addEventListener('mousedown', handleClickOutside);
      
        // 清理函数
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [visible, onClose, settinglistRef]);

    const [findLyrics, setFindLyrics] = useState(false);
    const [changeTheme, setChangeTheme] = useState(false);
    const [commonSetting, setCommonSetting] = useState(false);

    return (
        <div className={`${styles.settingList} ${visible ? styles.visible : ''}`}
        ref={panelRef}
        >
            <ul>
                <li className={styles.row} onClick={() => setFindLyrics(!findLyrics)}>查找歌词</li>
                <li className={styles.row}>格式转换</li>
                <li className={styles.row}>桌面模式</li>
                <li className={styles.row}>记住桌面位置</li>
                <li className={styles.row} onClick={() => setCommonSetting(!commonSetting)}>通用设置</li>
                <li className={styles.row} onClick={() => setChangeTheme(!changeTheme)}>皮肤</li>
                <li className={styles.row}>帮助</li>
            </ul>
              <FindLyrics
                findLyrics={findLyrics}
                setFindLyrics={setFindLyrics}
                data={data}
                setData={setData}
                panelRef={panelRef}
              />
              <ChangeTheme
                changeTheme={changeTheme}
                setChangeTheme={setChangeTheme}
                data={data}
                setData={setData}
                panelRef={panelRef}
                settingData={settingData}
                setSettingData={setSettingData}
              />

              <CommonSetting
                commonSetting={commonSetting}
                setCommonSetting={setCommonSetting}
                data={data}
                setData={setData}
                panelRef={panelRef}
                settingData={settingData}
                setSettingData={setSettingData}
              />
        </div>
    )
}