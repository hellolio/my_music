import ReactPlayer from 'react-player';
import { useState, useEffect, useRef, useImperativeHandle, forwardRef} from "react";
import { convertFileSrc } from '@tauri-apps/api/tauri';
import styles from "./Video.module.scss";

const Video = forwardRef((props, ref) => {
  const {data, setData} = props;
  const playerRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [playing, setPlaying] = useState(true);
  const [videoVolume, setVideoVolume] = useState(0.5); // 默认音量为 50%

  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [durationT, setDuration] = useState(0);

  const play = async (id, filePath, duration, skipSecs, volume) => {
    setPlaying(false);
    setVideoSrc(convertFileSrc(filePath));
    setVideoVolume(volume/100);
    setPlaying(true);
    playerRef.current?.getInternalPlayer()?.play();
    playerRef.current?.seekTo(skipSecs);
    setData(prevData => ({
      ...prevData,
      totalDuration: durationT
    }));
  };

  useEffect(() => {
    setData(prevData => ({
      ...prevData,
      barCurrentProgressSec: Math.floor(playedSeconds)
    }));
  }, [playedSeconds])

  const pause = () => {
      playerRef.current?.getInternalPlayer()?.pause();
  };

  const resume = () => {
      playerRef.current?.getInternalPlayer()?.play();
  };

  const stop = () => {
    playerRef.current?.getInternalPlayer()?.pause();
    setVideoSrc("");
    setPlaying(false);
  };

  const seek = (sec) => {
      playerRef.current?.seekTo(sec);
  };

  const setVolume = (volume) => {
    setVideoVolume(volume/100);
  }

  useImperativeHandle(ref, () => ({
    play: play, 
    pause: pause, 
    resume: resume, 
    stop: stop, 
    setVolume: setVolume, 
    seek: seek
  }));

  return (
      <div className={styles.myVideo}>
          <ReactPlayer 
            ref={playerRef}
            url={videoSrc}
            playing={playing}
            volume={videoVolume}
            onProgress={(state) => setPlayedSeconds(state.playedSeconds)}
            onDuration={(dur) => setDuration(dur)}
            controls
            width='100%' 
            height='90%'
          />
      </div>
  );
});

export default Video;
