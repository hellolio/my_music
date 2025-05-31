import React, { useEffect, useRef, useState } from "react";
import styles from "./SongList.module.scss";
import * as utils from "../../common/utils";
import * as player from "../../common/player";
import ShowMsg from "../showMsg/ShowMsg";
import SettingButton from "@/components/common/SettingButton/SettingButton";

import {
  importMusic,
  deleteMusic,
  handleCheckboxChange,
  handleAllCheckboxChange,
  getMusicListFormDB,
  handleCreate,
  switchTo,
  deletePlayList,
} from "./SongListFun";
import { div } from "framer-motion/client";

const SongList = ({ data, setData, allSongList, setAllSongList }) => {
  const panelRef = useRef(null);

  const [selectedItems, setSelectedItems] = useState([]);
  const [allCheck, setAllCheck] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [showDialog, setShowDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [updatePlayListFlg, setUpdatePlayListFlg] = useState(false);
  const [playlistName, setPlaylistName] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getMusicListFormDB(
      setCurrentIndex,
      setAllSongList,
      data,
      setData,
      setUpdatePlayListFlg
    );
  }, [updatePlayListFlg]);

  return (
    <div className={styles.songPanel}>
      <ul className={styles.list}>
        <div className={styles.container}>
          <div className={styles.rightButtons}>
            <div className={styles.playListTitle}>
              <h3>播放列表:</h3>
            </div>
            <div className={styles.rightButtons}>
              {allSongList.map((listObj, index) => {
                return (
                  <div key={index} id={`songlist-${index}`}>
                    <SettingButton
                      callFun={() => {
                        switchTo(
                          index,
                          listObj.id,
                          setCurrentIndex,
                          setData,
                          allSongList
                        );
                        document
                          .getElementById(`songlist-${index}`)
                          .scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                          });
                      }}
                      msg={listObj.name}
                      style={
                        listObj.id === data.playlistId
                          ? `${styles.switchSonglist} ${styles.active}`
                          : ""
                      }
                    />
                  </div>
                );
              })}

              <SettingButton
                callFun={() => {
                  setIsOpen(!isOpen);
                }}
                msg={"..."}
                style={styles.setting}
              />

              {isOpen && (
                <div>
                  <SettingButton
                    callFun={() => setShowDialog(true)}
                    msg={"+添加歌单"}
                    style={styles.setting}
                  />
                  <SettingButton
                    callFun={() => setShowConfirmDialog(true)}
                    msg={"×删除歌单"}
                    style={styles.setting}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.controllerButton}>
          <SettingButton
            callFun={() =>
              importMusic(
                data.playlistId,
                setUpdatePlayListFlg,
                setAllSongList,
                currentIndex
              )
            }
            msg={"添加"}
          />
          <SettingButton
            callFun={() =>
              handleAllCheckboxChange(
                allCheck,
                setAllCheck,
                setSelectedItems,
                allSongList,
                currentIndex
              )
            }
            msg={allCheck ? "全选" : "取消"}
          />
          <SettingButton
            callFun={() =>
              deleteMusic(
                selectedItems,
                setSelectedItems,
                setUpdatePlayListFlg,
                setAllSongList,
                currentIndex
              )
            }
            msg={"删除"}
          />
        </div>

        <li className={`${styles.playListTitle} ${styles.songList}`}>
          <span className={styles.index}>序号</span>
          <span className={styles.title}>歌名</span>
          <span className={styles.duration}>时长</span>
        </li>
      </ul>

      <div className={styles.sliderContainer}>
        <div
          className={styles.sliderWrapper}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {allSongList.map((listObj, listIndex) => {
            return (
              <ul key={listIndex} className={styles.list}>
                {listObj.songs.map((song, index) => (
                  <li
                    key={index}
                    className={`${styles.songList} ${
                      selectedItems.includes(song) ? styles.active : ""
                    } ${data.id === song.id ? styles.isPlaying : ""}`}
                    onClick={(e) =>
                      handleCheckboxChange(
                        e,
                        song,
                        selectedItems,
                        setSelectedItems
                      )
                    }
                    onDoubleClick={() =>
                      player.playMusicFromList(
                        song,
                        data,
                        setData,
                        data.playlistId
                      )
                    }
                  >
                    <span className={styles.index}>{index + 1}</span>
                    <span className={styles.title}>{song.title}</span>
                    <span className={styles.duration}>
                      {utils.formatTime(song.total_duration)}
                    </span>
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      </div>

      {showDialog && (
        <ShowMsg
          showMsgParam={{
            title: "创建歌单",
            placeholder: "请输入歌单名",
            isInput: true,
          }}
          inputValue={playlistName}
          setInputValue={setPlaylistName}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          callFun={handleCreate}
          callFunParam={{
            playlistName: playlistName,
            setPlaylistName: setPlaylistName,
            allSongList: allSongList,
            setShowDialog: setShowDialog,
            setUpdatePlayListFlg: setUpdatePlayListFlg,
          }}
        />
      )}

      {showConfirmDialog && (
        <ShowMsg
          showMsgParam={{
            title: `确认删除 "${allSongList[currentIndex].name}" 吗?`,
            isInput: false,
          }}
          inputValue={playlistName}
          setInputValue={setPlaylistName}
          showDialog={showConfirmDialog}
          setShowDialog={setShowConfirmDialog}
          callFun={deletePlayList}
          callFunParam={{
            allSongList: allSongList,
            playlistId: data.playlistId,
            setUpdatePlayListFlg: setUpdatePlayListFlg,
            setShowConfirmDialog: setShowConfirmDialog,
          }}
        />
      )}
    </div>
  );
};

export default SongList;
