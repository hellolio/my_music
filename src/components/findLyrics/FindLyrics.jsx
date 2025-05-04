import styles from "./FindLyrics.module.scss";
import ReactDOM from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';
import {get_lyrics_targets, get_lyrics, selectSavePath} from './FindLyricsFun'
import { invoke } from "@tauri-apps/api/tauri";
import * as utils from "../../common/utils"



export default function FindLyrics({findLyrics, setFindLyrics, data, setData, panelRef, onClose}) {

    const [songTitle, setSongTitle] = useState('');
    const [artistName, setArtistName] = useState('');
    const [resultList, setResultList] = useState([]);

    const [selectedRow, setSelectedRow] = useState(-1);

    const [savePath, setSavePath] = useState('');
    const [selected, setSelected] = useState(false);

    const FindLyricsRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (findLyrics && FindLyricsRef.current && !FindLyricsRef.current.contains(event.target) &&
          panelRef.current && !panelRef.current.contains(event.target)) {
            setFindLyrics(false);
          }
        };
      
        document.addEventListener('mousedown', handleClickOutside);
      
        // 清理函数
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [findLyrics, onClose, panelRef]);

    const searchLyrics = async () => {
      if (songTitle) {
        const results = await get_lyrics_targets(songTitle);
        console.log("results:",results);
        setResultList(results);
      } else {
        alert('请填写歌名');
      }
    };
  
    const saveLyrics = async () => {
      const target = resultList[selectedRow];
      console.log(target)
      if (savePath === '') {
        alert('请填写歌名');
      }else {
        let lyrics = await get_lyrics(target.album, target.artist[0], target.title, target.duration, target.id, savePath);
        if (selected) {
          setData(prevData => ({
            ...prevData,
            lyrics: lyrics,
          }));
          const lyrics = await invoke('add_lyrics', { lyricsFile: savePath, id: data.id });
        }
        alert('保存成功');
      }
    };

    return ReactDOM.createPortal(
        
        <div id="lyricModal" className={`${styles.modal} ${findLyrics ? styles.visible : ''}`}
          
        >
                <div className={styles.modalContent} ref={FindLyricsRef}>
                  <div className={styles.search}>
                      <h3>查找歌词</h3>
                      {/* <input
                        type="text"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="输入歌名"
                        className={styles.inputField}
                      /> */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="text"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="输入歌名"
                        className={styles.inputField}
                      />
                        <button 
                          onClick={searchLyrics} 
                          className={styles.btn}
                          style={{ marginLeft: "auto" }} // 推到右边
                        >
                          检索
                        </button>
                      </div>
                    </div>
                    <div className={styles.resultList}>
                        <table className={styles.resultListTable}>
                            <thead>
                            <tr>
                                <th style={{width: "60px"}}>歌名</th>
                                <th style={{width: "100px"}}>信息</th>
                                <th style={{width: "50px"}}>作者</th>
                                <th style={{width: "30px", textAlign:"right"}}>时长</th>
                            </tr>
                            </thead>
                            <tbody>
                            {resultList.map((result, index) => (
                                <tr 
                                  key={index} 
                                  className={`${styles.resultRow} ${selectedRow === index ? styles.selectedRow: ''}`}
                                  onClick={()=>setSelectedRow(index)}>
                                <td className={styles.rowOverHidden}>{result.title}</td>
                                <td className={styles.rowOverHidden}>{result.subtitle}</td>
                                <td className={styles.rowOverHidden}>{result.artist}</td>
                                <td className={styles.rowOverHidden} style={{textAlign:"right"}}>{utils.formatTime(result.duration)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                      </div>

                      <div className={styles.buttonRow}>
                        {/* 左侧区域 */}
                        <div className={styles.leftControls}>
                          <button className={styles.btn} onClick={() => selectSavePath(setSavePath, resultList[selectedRow].title)}>
                            选择保存路径
                          </button>
                          <label htmlFor="savePath" className={styles.savePathLabel}>
                            {savePath}
                          </label>
                        </div>
                      </div>
                      {/* 右侧按钮区域 */}
                      <div className={`${styles.buttonRow} ${styles.rightControls}`}>
                        <div className={styles.leftControls}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => setSelected(!selected)}
                        />
                          <label htmlFor="savePath" className={styles.savePathLabel}>
                            设置为当前歌曲的歌词
                          </label>
                        </div>

                        <div className={`${styles.rightControls}`}>
                          <button onClick={saveLyrics} className={styles.btn}>保存</button>
                          <button onClick={() => setFindLyrics(false)} className={`${styles.btn} ${styles.btnCancel}`}>取消</button>
                        </div>
                      </div>
            </div>
      </div>,
        document.body // 指定挂载点
    )
}