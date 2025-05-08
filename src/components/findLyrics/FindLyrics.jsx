import styles from "./FindLyrics.module.scss";
import React, { useState } from 'react';
import {selectSavePath, saveLyrics, searchLyrics} from './FindLyricsFun'
import * as utils from "../../common/utils"

import MyButton from "@/components/common/button/MyButton";
import MyInput from "@/components/common/input/MyInput";

export default function FindLyrics({data, setData}) {

    const [songTitle, setSongTitle] = useState('');
    const [resultList, setResultList] = useState([]);

    const [selectedRow, setSelectedRow] = useState(-1);

    const [savePath, setSavePath] = useState('');
    const [selected, setSelected] = useState(false);

    return (
        <div>
          <div className={styles.search}>
              <h3>查找歌词</h3>
              <div style={{ display: "flex", alignItems: "center" }}>
              <MyInput 
                type={'text'}
                value={songTitle}
                setValue={setSongTitle}
                placeholder="输入歌名"
              />
                <MyButton 
                    callFun={() => searchLyrics(songTitle, setResultList)}
                    msg={'检索'}
                    isConfirm={true}
                  />
              </div>
            </div>
            <div className={styles.resultListWrapper}>
            {/* 表头部分 */}
            <table className={styles.resultListTable}>
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "left" }}>歌名</th>
                  <th style={{ width: "100px", textAlign: "center"  }}>信息</th>
                  <th style={{ width: "50px", textAlign: "center"  }}>作者</th>
                  <th style={{ width: "30px", textAlign: "right" }}>时长</th>
                </tr>
              </thead>
            </table>

            {/* 内容部分 */}
            <div className={styles.resultList}>
              <table className={styles.resultListTable}>
                <tbody>
                  {resultList.map((result, index) => (
                    <tr
                      key={index}
                      className={`${styles.resultRow} ${selectedRow === index ? styles.selectedRow : ''}`}
                      onClick={() => setSelectedRow(index)}
                    >
                      <td className={styles.rowOverHidden} style={{ width: "60px", textAlign: "left"  }}>{result.title}</td>
                      <td className={styles.rowOverHidden} style={{ width: "100px", textAlign: "center"  }}>{result.subtitle}</td>
                      <td className={styles.rowOverHidden} style={{ width: "50px", textAlign: "center"  }}>{result.artist}</td>
                      <td className={styles.rowOverHidden} style={{ width: "30px", textAlign: "right" }}>
                        {utils.formatTime(result.duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

              <div className={`${styles.postControls}`}>
                {/* 左侧区域 */}
                <div className={styles.leftControls}>
                  <MyButton 
                    callFun={() => selectSavePath(setSavePath, resultList, selectedRow, songTitle)}
                    msg={'选择保存路径'}
                    isConfirm={true}
                  />
                  {/* <label htmlFor="savePath" className={styles.savePathLabel}>
                    {savePath}
                  </label> */}
                  <MyInput 
                    type={'text'}
                    value={savePath}
                    setValue={setSavePath}
                    placeholder="输入保存路径"
                  />
                </div>
              </div>

              <div className={`${styles.postControls}`}>
                <div className={styles.leftControls}
                  onClick={() => setSelected(!selected)}
                >
                <input
                  type="checkbox"
                  readOnly
                  checked={selected}
                  // onChange={() => setSelected(!selected)}
                />

                  <label htmlFor="savePath" className={styles.savePathLabel}
                  >设置为当前歌曲的歌词
                  </label>
                  
                </div>
                <label htmlFor="" className={styles.savePathLabel}></label>

                <div className={`${styles.rightControls}`}>
                  <MyButton 
                    callFun={()=>saveLyrics(resultList, selectedRow, savePath, selected, data, setData)}
                    msg={'保存'}
                    isConfirm={true}
                  />
                </div>
              </div>  
          </div>
    )
}