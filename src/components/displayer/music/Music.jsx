import { invoke } from "@tauri-apps/api/tauri";
import { useState, useRef, useImperativeHandle, forwardRef} from "react";

import LyricsPlayer from "@/components/displayer/lyricsPlayer/LyricsPlayer";
import TitlePlayer from "@/components/displayer/titlePlayer/TitlePlayer";

import styles from './Music.module.scss';

const Music = forwardRef((props, ref) => {
    const {data, setData} = props;

    const get_cover = async (inputPath) => {
      const cover_image_path = await invoke('get_cover_from_music', { inputPath: inputPath });
      return cover_image_path;
    };

    const play = async (id, filePath, duration, skipSecs, volume) => {
      // await invoke('stop_music');
      let song = await invoke('play_music', { id: id, filePath: filePath, duration: duration, skipSecs: skipSecs, volume: volume/100 });
      
      return song;
  };
  
    const pause = async () => {
      await invoke('pause_music');
    };
  
    const resume = async () => {
      await invoke('resume_music');
    };
  
    const stop = async () => {
      await invoke('stop_music');
    
    };
  
    const seek = async (sec, volume) => {
        await invoke('seek_music', { skipSecs: sec, volume: volume/100 });
    };

    const setVolume = async (volume) => {
      await invoke('control_volume', { volume: volume/100 });
    };

    useImperativeHandle(ref, () => ({
      get_cover: get_cover,
      play: play, 
      pause: pause, 
      resume: resume, 
      stop: stop, 
      setVolume: setVolume, 
      seek: seek
    }));

    return (
        <div className={styles.myMusic}>
          <div className={`${styles.parent} ${styles.title}`}>
            <TitlePlayer data={data} setData={setData}/>
          </div>

          <div className={`${styles.parent} ${styles.lyrics}`}>
            <LyricsPlayer data={data} setData={setData}/>
          </div>

        </div>
      );
});

export default Music;