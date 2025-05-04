import React, { useEffect, useRef, useState } from 'react';
import styles from "./SettingList.module.scss";

import FindLyrics from '../findLyrics/FindLyrics';

export const SettingList = ({visible, onClose, settinglistRef, data, setData}) => {

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

    const [findLyrics, setFindLyrics] = useState(true);

    return (
        <div className={`${styles.settingList} ${visible ? styles.visible : ''}`}
        ref={panelRef}
        >
            <ul>
                <li onClick={() => setFindLyrics(!findLyrics)}>查找歌词</li>
                <li>格式转换</li>
                <li>桌面模式</li>
                <li>记住桌面位置</li>
                <li>皮肤</li>
                <li>帮助</li>
            </ul>
            {/* {findLyrics &&  */}
              <FindLyrics
              findLyrics={findLyrics}
              setFindLyrics={setFindLyrics}
              data={data}
              setData={setData}
              panelRef={panelRef}
              />
            
        </div>
    )
}