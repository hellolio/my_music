import React, { useEffect, useRef, useState } from 'react';
import './SongList.css';
import utils from "../../common/utils"
import {importMusic, deleteMusic, handleCheckboxChange, playMusicFromList, getMusicListFormDB} from './SongListFun';

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

  // 初次加载的时候从数据库获取歌曲列表
  useEffect(() => {
    getMusicListFormDB(setSongs, data, setData);
  }, []);

  return (
    <div className={`song-panel ${visible ? 'visible' : ''}`} ref={panelRef}>
      <h2>歌单列表</h2>
      <ul>
        <li>
          <span>序号</span>
          <span>歌名</span>
          <span>时长</span>
        </li>
      </ul>
      <ul>
        {songs.map((song, index) => (
          <li key={index}
            className={selectedItems.includes(song) ? "song-list active" : "song-list"}
            onClick={(e) => handleCheckboxChange(e, song, selectedItems, setSelectedItems)}
            onDoubleClick={() => playMusicFromList(song.id, song.audio_src, song.title, song.total_duration, data, setData)} >
            {/* <input
              type="checkbox"
              checked={selectedItems.includes(song)}
              onChange={(e) => handleCheckboxChange(e, song, setSelectedItems)}
            /> */}

            <span>{index + 1}.</span>
            <span className="title">{song.title}</span>
            <span>{utils.formatTime(song.total_duration)}</span>
          </li>
        ))}
      </ul>
      <div className='add-delete'>
        <div className="add-songlist" onClick={() => importMusic(songs, setSongs)} >
          <img src="/img/添加歌曲.ico" alt="add"/>
          添加
        </div>
        <div className="delete-songlist" onClick={() => deleteMusic(setSongs, selectedItems, setSelectedItems)}>
          <img src="/img/删除歌曲.ico" alt="delete" />
          删除
        </div>
      </div>

    </div>
  );
};

export default SongList;
