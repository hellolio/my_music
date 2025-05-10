import React, { useEffect, useRef, useState } from 'react';
import styles from "./SearchedList.module.scss";
import * as utils from "@/common/utils"


export const SearchedList = ({data, setData, searchedListRst}) => {

    const SettingRef = useRef(null);
    
    return (
      <div ref={SettingRef}>
        <ul className={styles.list}>
            {searchedListRst.map((song, index) => (
              <li
                className={styles.row} 
                key={index}
                onClick={() => {
                  utils.playMusicFromList(song, data, setData, song.playlistId)
                }}
              >
                <span className={styles.index}>{`${index + 1}-${song.title}-${song.total_duration}`}</span>
              </li>
            ))}
        </ul>
      </div>
    )
}