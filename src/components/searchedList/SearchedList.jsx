import React, { useRef } from "react";
import styles from "./SearchedList.module.scss";
import * as player from "@/common/player";
import * as utils from "@/common/utils";

export const SearchedList = ({ data, setData, searchedListRst }) => {
  const SettingRef = useRef(null);

  return (
    <div ref={SettingRef}>
      <ul className={styles.list}>
        {searchedListRst.map((song, index) => (
          <li
            className={styles.row}
            key={index}
            onClick={() => {
              player.playMusicFromList(song, data, setData, song.playlistId);
            }}
          >
            {`${song.title}-${song.author + 1}-${utils.formatTime(
              song.total_duration
            )}`}
          </li>
        ))}
      </ul>
    </div>
  );
};
