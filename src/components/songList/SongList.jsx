import React, { useEffect, useRef, useState } from 'react';
import './SongList.css';
import utils from "../../common/utils"
import {importMusic, deleteMusic, handleCheckboxChange, handleAllCheckboxChange, playMusicFromList, getMusicListFormDB, switchTo, handleCreate, deletePlayList} from './SongListFun';

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
  const [playlistName, setPlaylistName] = useState('');
  const [createPlaylistFlg, setCreatePlaylistFlg] = useState(false);

  // 初次加载的时候从数据库获取歌曲列表
  useEffect(() => {
    getMusicListFormDB(setCurrentIndex, setAllSongList, setSongs, data, setData, setCreatePlaylistFlg);
  }, [createPlaylistFlg]);


  return (
    <div className={`song-panel ${visible ? 'visible' : ''}`} ref={panelRef}>

      <ul>
        <li>
          <span className="index">序号</span>
          <span className="title">歌名</span>
          <span className="duration">时长</span>
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
                  className={selectedItems.includes(song) ? "song-list active" : "song-list"}
                  onClick={(e) => handleCheckboxChange(e, song, selectedItems, setSelectedItems)}
                  onDoubleClick={() =>
                    playMusicFromList(song.id, song.audio_src, song.title, song.total_duration, data, setData)
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
      <li>
        {allSongList.map((listObj, index) => {
          return (
            <div
              key={index}
              className={listObj.id===data.playlistId ? "switch-songlist active": "switch-songlist"}
              onClick={() => switchTo(index, listObj.id, setCurrentIndex, setData, setSongs, allSongList)}
            >
              {listObj.name}
            </div>
          );
        })}
        <div key={9998} className="switch-songlist" onClick={() => setShowDialog(true)}>+</div>
        <div key={9999} className="switch-songlist" onClick={() => deletePlayList(allSongList, data.playlistId, setCreatePlaylistFlg)}>-</div>
        {showDialog && (
        <div className="dialog">
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="歌单名"
          />
          <br />
          <button onClick={() => handleCreate(playlistName, allSongList, setShowDialog, setPlaylistName, setCreatePlaylistFlg)}>确认</button>
          <button onClick={() => setShowDialog(false)}>取消</button>
        </div>
      )}
      </li>
      <div className='add-delete'>
          <div className="all-songlist" onClick={() => handleAllCheckboxChange(allCheck, setAllCheck, songs, setSelectedItems)} >
            <img src="/img/全选.ico" alt="allcheck"/>
            <span>{allCheck ? '全选歌曲': '取消全选'}</span>
          </div>
          <div className="add-songlist" onClick={() => importMusic(songs, setSongs, data.playlistId, setCreatePlaylistFlg)} >
            <img src="/img/添加歌曲.ico" alt="add"/>
            <span>添加歌曲</span>
          </div>
          <div className="delete-songlist" onClick={() => deleteMusic(setSongs, selectedItems, setSelectedItems)}>
            <img src="/img/删除歌曲.ico" alt="delete" />
            <span>删除歌曲</span>
          </div>
        </div>
    </div>
  );
};

export default SongList;
