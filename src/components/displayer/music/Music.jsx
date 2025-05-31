import { forwardRef } from "react";

import LyricsPlayer from "@/components/displayer/lyricsPlayer/LyricsPlayer";
import TitlePlayer from "@/components/displayer/titlePlayer/TitlePlayer";

import { useMusicFun } from "./MusicFun";
import styles from "./Music.module.scss";

const Music = forwardRef(({ data, setData }, ref) => {
  useMusicFun(ref);

  return (
    <div className={styles.myMusic}>
      <div className={`${styles.parent} ${styles.title}`}>
        <TitlePlayer data={data} setData={setData} />
      </div>

      <div className={`${styles.parent} ${styles.lyrics}`}>
        <LyricsPlayer data={data} setData={setData} />
      </div>
    </div>
  );
});

export default Music;
