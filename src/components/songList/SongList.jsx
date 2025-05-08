import React, { useEffect, useRef, useState, useContext  } from 'react';
import styles from './SongList.module.scss';
import * as utils from "../../common/utils"
import ShowMsg from '../showMsg/ShowMsg';
import MyButton from "@/components/common/button/MyButton";
import { Context } from '../common/context/MyProvider';

import {importMusic, deleteMusic, handleCheckboxChange, handleAllCheckboxChange, getMusicListFormDB, handleCreate, switchTo, deletePlayList} from './SongListFun';
import { createPortal } from 'react-dom';

const SongList = ({ data, setData, visible, onClose, songs, setSongs, listBtnPlayerRef }) => {
  const panelRef = useRef(null);

  // 点击组件外自动收起
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((panelRef.current && !panelRef.current.contains(event.target)) && (listBtnPlayerRef.current && !listBtnPlayerRef.current.contains(event.target))){
        onClose(); // 调用父组件的关闭函数
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // 清理
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // 用来保存选中的复选框的 id
  const [selectedItems, setSelectedItems] = useState([]);
  const [allCheck, setAllCheck] = useState(true);

  const { allSongList, setAllSongList } = useContext(Context);

  // 切换到某个歌单
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showDialog, setShowDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [updatePlayListFlg, setUpdatePlayListFlg] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  // 初次加载的时候从数据库获取歌曲列表
  useEffect(() => {
    getMusicListFormDB(setCurrentIndex, setAllSongList, setSongs, data, setData, setUpdatePlayListFlg);
  }, [updatePlayListFlg]);

  const panel = (
    <div className={`${styles.songPanel} ${visible ? styles.visible : ''}`} ref={panelRef}>
      <ul>
        <li className={styles.playListTitle}>
          <span className={styles.index}><h3>序号</h3></span>
          <span className={styles.title}><h3>歌名</h3></span>
          <span className={styles.duration}><h3>时长</h3></span>
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
                    className={`${styles.songList} ${selectedItems.includes(song) ? styles.active : ''} ${data.id === song.id ? styles.isPlaying : ''}`}
                    onClick={(e) => handleCheckboxChange(e, song, selectedItems, setSelectedItems)}
                    onDoubleClick={() => utils.playMusicFromList(song, data, setData)}
                  >
                    <span className={styles.index}>{index + 1}</span>
                    <span className={styles.title}>{song.title}</span>
                    <span className={styles.duration}>{utils.formatTime(song.total_duration)}</span>
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      </div>
  
      <div className={styles.addDelete}>
        <MyButton 
          callFun={() => handleAllCheckboxChange(allCheck, setAllCheck, songs, setSelectedItems)}
          msg={allCheck ? '全选' : '取消'}
          isConfirm={true}
          style={styles.setting}
        />
        <MyButton 
            callFun={() => importMusic(songs, setSongs, data.playlistId, setUpdatePlayListFlg)}
            msg={'添加'}
            isConfirm={true}
            style={styles.setting}
          />
        <MyButton 
            callFun={() => deleteMusic(setSongs, selectedItems, setSelectedItems, setUpdatePlayListFlg)}
            msg={'删除'}
            isConfirm={true}
            style={styles.setting}
          />
      </div>
  
      <hr />
  
      <div className={styles.playList}>
        <div className={styles.leftScrollWrapper}>
          <div className={styles.leftButtons}>
            {allSongList.map((listObj, index) => {
              return (
                <div
                  key={index}
                  id={`songlist-${index}`}
                >
                  <MyButton 
                    callFun={() => {
                      switchTo(index, listObj.id, setCurrentIndex, setData, setSongs, allSongList);
                      document.getElementById(`songlist-${index}`).scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                      });
                    }}
                    msg={listObj.name}
                    isConfirm={true}
                    style={listObj.id === data.playlistId ? `${styles.switchSonglist} ${styles.active}` : ''}
                />
                </div>
                
              );
            })}
          </div>
        </div>
  
        <div className={styles.rightButtons}>
          <div className={styles.switchQrap}><span>|</span></div>
          <MyButton 
            callFun={() => setShowDialog(true)}
            msg={'+'}
            isConfirm={true}
            style={styles.setting}
          />
          <MyButton 
            callFun={() => setShowConfirmDialog(true)}
            msg={'-'}
            isConfirm={true}
            style={styles.setting}
          />
        </div>
  
        {showDialog && (
          <ShowMsg
            showMsgParam={{ title: "创建歌单", placeholder: "请输入歌单名", isInput: true }}
            inputValue={playlistName}
            setInputValue={setPlaylistName}
            showDialog={showDialog}
            setShowDialog={setShowDialog}
            callFun={handleCreate}
            callFunParam={{playlistName: playlistName, setPlaylistName: setPlaylistName, allSongList: allSongList, setShowDialog: setShowDialog, setUpdatePlayListFlg: setUpdatePlayListFlg}}
          />
        )}
  
        {showConfirmDialog && (
          <ShowMsg
            showMsgParam={{ title: `确认删除 "${allSongList[currentIndex].name}" 吗?`, isInput: false }}
            inputValue={playlistName}
            setInputValue={setPlaylistName}
            showDialog={showConfirmDialog}
            setShowDialog={setShowConfirmDialog}
            callFun={deletePlayList}
            callFunParam={{allSongList: allSongList, playlistId: data.playlistId, setUpdatePlayListFlg: setUpdatePlayListFlg, setShowConfirmDialog: setShowConfirmDialog}}
          />
        )}
      </div>
    </div>
  );
  
  return createPortal(panel, document.body);
};

export default SongList;
