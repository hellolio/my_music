import React, { useEffect, useRef, useState } from 'react';
import './SongList.css';
import * as utils from "../../common/utils"
import ShowMsg from '../showMsg/ShowMsg';

import {importMusic, deleteMusic, handleCheckboxChange, handleAllCheckboxChange, playMusicFromList, getMusicListFormDB, handleCreate, switchTo, deletePlayList} from './SongListFun';
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
  const [allCheck, setAllCheck] = useState(false);

  // 所有歌单list
  const [allSongList, setAllSongList] = useState([]);

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
    <div className={`song-panel ${visible ? 'visible' : ''}`} ref={panelRef}>

      <ul>
        <li className='play-list-title'>
          <span className="index"><h3>序号</h3></span>
          <span className="title"><h3>歌名</h3></span>
          <span className="duration"><h3>时长</h3></span>
        </li>
      </ul>

      <div className="slider-container">
        <div
          className="slider-wrapper"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
        {allSongList.map((listObj, listIndex) => {
          return (
            <ul key={listIndex} className="list">
              {listObj.songs.map((song, index) => (
                <li
                  key={index}
                  // className={`selectedItems.includes(song) ? "song-list active" : "song-list"`}
                  className={`song-list ${selectedItems.includes(song) ? 'active':''} ${data.id === song.id ? 'isPlaying': ''}`}
                  onClick={(e) => handleCheckboxChange(e, song, selectedItems, setSelectedItems)}
                  onDoubleClick={() =>{
                    playMusicFromList(song, data, setData)
                  }
                  }
                >
                  <span className="index">{index + 1}.</span>
                  <span className="title">{song.title}</span>
                  <span className="duration">{utils.formatTime(song.total_duration)}</span>
                </li>
              ))}
            </ul>
          );
        })}
        </div>
      </div>
      <div className='add-delete'>
        <button className="all-songlist" onClick={() => handleAllCheckboxChange(allCheck, setAllCheck, songs, setSelectedItems)} >
          {allCheck ? '全选歌曲': '取消全选'}
        </button>
        <button className="add-songlist" onClick={() => importMusic(songs, setSongs, data.playlistId, setUpdatePlayListFlg)} >
          添加歌曲
        </button>
        <button className="delete-songlist" onClick={() => deleteMusic(setSongs, selectedItems, setSelectedItems, setUpdatePlayListFlg)}>
          删除歌曲
        </button>
      </div>
      <hr />
      <div className='play-list'>
        <div className="left-scroll-wrapper">
          <div className='left-buttons'>
            {allSongList.map((listObj, index) => {
              return (
                <button
                  key={index}
                  id={`songlist-${index}`}
                  className={listObj.id===data.playlistId ? "switch-songlist active": "switch-songlist"}
                  onClick={() => {
                    switchTo(index, listObj.id, setCurrentIndex, setData, setSongs, allSongList)
                    // 滚动到当前元素
                    document.getElementById(`songlist-${index}`).scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                    });
                  }}
                >
                  {listObj.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className='right-buttons'>
            <div>|</div>
            <div key={9998} className="switch-button" onClick={() => setShowDialog(true)}><img src="/img/添加.ico" alt="add"/></div>
            <div key={9999} className="switch-button" onClick={() => setShowConfirmDialog(true)}><img src="/img/删除.ico" alt="del"/></div>
          </div>
          {showDialog && (
            <ShowMsg
              showMsgParam = {{title: "创建歌单", placeholder:"请输入歌单名", isInput: true}}
              inputValue = {playlistName}
              setInputValue = {setPlaylistName}
              showDialog = {showDialog}
              setShowDialog = {setShowDialog}
              callFun={handleCreate}
              callFunParam={{playlistName: playlistName, setPlaylistName: setPlaylistName, allSongList: allSongList, setShowDialog: setShowDialog, setUpdatePlayListFlg: setUpdatePlayListFlg}}
            />
          )}

          {showConfirmDialog && (
            <ShowMsg
              showMsgParam = {{title: `确认删除 "${allSongList[currentIndex].name}" 吗?`, isInput: false}}
              inputValue = {playlistName}
              setInputValue = {setPlaylistName}
              showDialog = {showConfirmDialog}
              setShowDialog = {setShowConfirmDialog}
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
