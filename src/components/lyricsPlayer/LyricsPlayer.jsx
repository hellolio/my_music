
import { useState, useEffect, useRef } from "react";
import "./LyricsPlayer.css";

import {addLyrics} from "./LyricsPlayerFun"

function LyricsPlayer(props) {
    const {data, setData} = props;

    // 2. 当前高亮行索引
    const [activeIndex, setActiveIndex] = useState(0);
    
    // 3. 获取容器和列表的 DOM 引用
    const containerRef = useRef(null);
    const listRef = useRef([]);

    // 4. 根据时间更新高亮行
    useEffect(() => {
        if (!data.lyrics.length) return;
        
        // 找到第一个时间超过 barCurrentProgressSec 的索引
        const index = data.lyrics.findIndex((e) => e.time > data.barCurrentProgressSec);
        const newIndex = index === -1 ? data.lyrics.length - 1 : Math.max(0, index - 1);
        
        setActiveIndex(newIndex);
    }, [data]);

    // 5. 自动滚动到当前行
    useEffect(() => {
        if (!containerRef.current || !listRef.current[activeIndex]) return;

        const container = containerRef.current;
        const activeItem = listRef.current[activeIndex];
        
        // 计算滚动位置（居中）
        const containerHeight = container.clientHeight;
        const itemHeight = activeItem.clientHeight;
        const itemTop = activeItem.offsetTop;
        const scrollTop = itemTop - containerHeight / 2 + itemHeight / 2;

        // 平滑滚动
        container.scrollTo({
        top: scrollTop,
        behavior: "smooth"
        });
    }, [activeIndex]);


    return (
        <div className="container lyrics">
            <div 
            ref={containerRef}
            className="center-lyrics">
                <ul className="center-lyrics-line">
                    {data.lyrics.length === 0 && <button onClick={()=>addLyrics(data, setData)}>添加歌词</button>}
                    {data.lyrics.map((line, index) => (
                        <li 
                        ref={(el) => (listRef.current[index] = el)}
                        className={activeIndex === index ? "active" : ""}
                            key={index}>{line.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
export default LyricsPlayer;