
import { useState, useEffect, useRef } from "react";
import styles from "./LyricsPlayer.module.scss";

import {addLyrics, handleLyricClick} from "./LyricsPlayerFun"

function LyricsPlayer(props) {
    const {data, setData} = props;


    const [activeIndex, setActiveIndex] = useState(0);
    

    const containerRef = useRef(null);
    const listRef = useRef([]);


    useEffect(() => {
        if (!data.lyrics.length) return;

        const index = data.lyrics.findIndex((e) => e.time > data.barCurrentProgressSec);
        const newIndex = index === -1 ? data.lyrics.length - 1 : Math.max(0, index - 1);
        setActiveIndex(newIndex);
    }, [data.barCurrentProgressSec]);


    useEffect(() => {
        if (!containerRef.current || !listRef.current[activeIndex]) return;

        const container = containerRef.current;
        const activeItem = listRef.current[activeIndex];
        

        const containerHeight = container.clientHeight;
        const itemHeight = activeItem.clientHeight;
        const itemTop = activeItem.offsetTop;
        const scrollTop = itemTop - containerHeight / 2 + itemHeight / 2;


        container.scrollTo({
        top: scrollTop,
        behavior: "smooth"
        });
    }, [activeIndex]);

    return (
        <div className={`${styles.container} ${styles.lyrics}`}>
          <div ref={containerRef} className={styles.centerLyrics}>
            <button className={styles.overLoadLyrics} onClick={() => addLyrics(data, setData)}>
              重载歌词
            </button>
            <ul
              className={styles.centerLyricsLine}

            >
              {data.lyrics.map((line, index) => (
                <li
                  ref={(el) => (listRef.current[index] = el)}
                  className={`${styles.list} ${activeIndex === index ? styles.active : ''}`}
                  key={index}
                  onDoubleClick={() => handleLyricClick(line, index, data, setData)}
                >
                  {line.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
}
export default LyricsPlayer;