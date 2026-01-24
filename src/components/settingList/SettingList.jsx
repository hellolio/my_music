import React, { useEffect, useRef, useState } from "react";
import styles from "./SettingList.module.scss";
import { convertFileSrc } from "@tauri-apps/api/core";

import * as utils from "@/common/utils";

import FindLyrics from "../findLyrics/FindLyrics";
import ChangeTheme from "../changeTheme/ChangeTheme";
import CommonSetting from "../commonSetting/CommonSetting";
import ModalComFloat from "../common/modalComFloat/ModalComFloat";

export const SettingList = ({ data, setData }) => {
  const [findLyrics, setFindLyrics] = useState(false);
  const [changeTheme, setChangeTheme] = useState(false);
  const [commonSetting, setCommonSetting] = useState(false);

  const settingDataTmp = localStorage.getItem("settingData");
  const settingDataTmpParse = JSON.parse(settingDataTmp);
  const [settingData, setSettingData] = useState({
    isChange: true,
    useMusicCover: settingDataTmp ? settingDataTmpParse.useMusicCover : false,
    coverImagePath: settingDataTmp ? settingDataTmpParse.coverImagePath : "",
    selectedRemeberSize: settingDataTmp
      ? settingDataTmpParse.selectedRemeberSize
      : true,
    selectedDongan: settingDataTmp ? settingDataTmpParse.selectedDongan : false,
    backColor: settingDataTmp
      ? settingDataTmpParse.backColor
      : "rgba(121, 121, 121, 0.988)",
    backdropFilter: settingDataTmp ? settingDataTmpParse.backdropFilter : 10,
  });

  useEffect(() => {
    if (settingData.useMusicCover) {
      if (data.coverImagePath === "") {
        imageUrl = convertFileSrc(settingData.coverImagePath);
      } else {
        imageUrl = convertFileSrc(data.coverImagePath);
      }
      document
        .getElementById("myPlayer")
        ?.style.setProperty("--cover-bg", `url(${imageUrl})`);
    } else {
      document
        .getElementById("myPlayer")
        ?.style.setProperty(
          "--cover-bg",
          `url(${convertFileSrc(settingData.coverImagePath)})`
        );
    }

    document
      .getElementById("myPlayer")
      ?.style.setProperty("--bg-color", settingData.backColor);
    document
      .getElementById("myPlayer")
      ?.style.setProperty("--blur-radius", `${settingData.backdropFilter}px`);

    localStorage.setItem("settingData", JSON.stringify(settingData));
  }, [settingData]);

  let imageUrl = "";

  useEffect(() => {
    if (settingData.useMusicCover) {
      if (data.coverImagePath === "") {
        imageUrl = convertFileSrc(settingData.coverImagePath);
      } else {
        imageUrl = convertFileSrc(data.coverImagePath);
      }
      document
        .getElementById("myPlayer")
        ?.style.setProperty("--cover-bg", `url(${imageUrl})`);
    } else {
      document
        .getElementById("myPlayer")
        ?.style.setProperty(
          "--cover-bg",
          `url(${convertFileSrc(settingData.coverImagePath)})`
        );
    }
  }, [data.coverImagePath]);

  const SettingRef = useRef(null);

  return (
    <div ref={SettingRef}>
      <ul className={styles.list}>
        <li className={styles.row} onClick={() => setFindLyrics(!findLyrics)}>
          查找歌词
        </li>
        <li className={styles.row}>格式转换</li>
        <li
          className={styles.row}
          onClick={() => setCommonSetting(!commonSetting)}
        >
          通用设置
        </li>
        <li className={styles.row} onClick={() => setChangeTheme(!changeTheme)}>
          皮肤
        </li>
      </ul>

      <ModalComFloat
        visible={findLyrics}
        setVisible={setFindLyrics}
        panelRef={SettingRef}
        children={<FindLyrics data={data} setData={setData} />}
      />

      <ModalComFloat
        visible={changeTheme}
        setVisible={setChangeTheme}
        panelRef={SettingRef}
        children={
          <ChangeTheme
            data={data}
            setData={setData}
            settingData={settingData}
            setSettingData={setSettingData}
          />
        }
      />

      <ModalComFloat
        visible={commonSetting}
        setVisible={setCommonSetting}
        panelRef={SettingRef}
        children={
          <CommonSetting
            settingData={settingData}
            setSettingData={setSettingData}
            readWindowState={utils.readWindowState}
            writeWindowState={utils.writeWindowState}
          />
        }
      />
    </div>
  );
};
