import React, { useEffect, useRef, useState } from 'react';
import styles from "./SettingList.module.scss";
import { convertFileSrc } from '@tauri-apps/api/tauri';

import {readWindowState, writeWindowState} from './SettingListFun'

import FindLyrics from '../findLyrics/FindLyrics';
import ChangeTheme from '../changeTheme/ChangeTheme';
import CommonSetting from '../commonSetting/CommonSetting';


export const SettingList = ({panelRef, data, setData}) => {

    const [findLyrics, setFindLyrics] = useState(false);
    const [changeTheme, setChangeTheme] = useState(false);
    const [commonSetting, setCommonSetting] = useState(false);

    const settingDataTmp = localStorage.getItem('settingData');
    const settingDataTmpParse = JSON.parse(settingDataTmp);
    const [settingData, setSettingData] = useState(
      {
        isChange: true,
        useMusicCover: settingDataTmp ? settingDataTmpParse.useMusicCover : true,
        coverImagePath: settingDataTmp ? settingDataTmpParse.coverImagePath : "",
        selectedRemeberSize:  settingDataTmp ? settingDataTmpParse.selectedRemeberSize : true,
        selectedDongan: settingDataTmp ? settingDataTmpParse.selectedDongan : false,
      }
    )
  
    useEffect(() => {
      if (settingData.useMusicCover) {
        if (data.coverImagePath === ""){
          imageUrl = convertFileSrc(settingData.coverImagePath);
        }else {
          imageUrl = convertFileSrc(data.coverImagePath);
        }
        document.body.style.setProperty('--cover-bg', `url(${imageUrl})`);
      } else {
        document.body.style.setProperty('--cover-bg', `url(${convertFileSrc(settingData.coverImagePath)})`);
      }
  
      localStorage.setItem('settingData', JSON.stringify(settingData));
    }, [settingData]);

    let imageUrl = "";

    useEffect(() => {
      if (settingData.useMusicCover) {
          if (data.coverImagePath === ""){
            imageUrl = convertFileSrc(settingData.coverImagePath);
          }else {
            imageUrl = convertFileSrc(data.coverImagePath);
          }
          document.body.style.setProperty('--cover-bg', `url(${imageUrl})`);
      } else {
        document.body.style.setProperty('--cover-bg', `url(${convertFileSrc(settingData.coverImagePath)})`);
      }
    }, [data.coverImagePath]);

    const SettingRef = useRef(null);
    
    return (
      <div ref={SettingRef}>
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
          panelRef={SettingRef}
        />
        <ChangeTheme
          changeTheme={changeTheme}
          setChangeTheme={setChangeTheme}
          data={data}
          setData={setData}
          panelRef={SettingRef}
          settingData={settingData}
          setSettingData={setSettingData}
        />

        <CommonSetting
          commonSetting={commonSetting}
          setCommonSetting={setCommonSetting}
          data={data}
          setData={setData}
          panelRef={SettingRef}
          settingData={settingData}
          setSettingData={setSettingData}
          readWindowState={readWindowState}
          writeWindowState={writeWindowState}
        />  
      </div>
    )
}