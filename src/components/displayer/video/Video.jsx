import ReactPlayer from 'react-player';
import { useState, useRef, useImperativeHandle, forwardRef} from "react";
import { open } from "@tauri-apps/api/dialog";
import { convertFileSrc } from '@tauri-apps/api/tauri';
import "./Video.css";

const Video = forwardRef((props, ref) => {
  const {data, setData} = props;
  const playerRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [playing, setPlaying] = useState(true);
  const [videoVolume, setVideoVolume] = useState(0.5); // 默认音量为 50%

  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = async (id, filePath, duration, skipSecs, volume) => {
    setVideoSrc(convertFileSrc(filePath));
    setVideoVolume(volume);
    console.log("videoSrc:", videoSrc);
    playerRef.current?.getInternalPlayer()?.play();
    playerRef.current?.seekTo(skipSecs);
};

  const pause = () => {
      playerRef.current?.getInternalPlayer()?.pause();
  };

  const resume = () => {
      playerRef.current?.getInternalPlayer()?.play();
  };

  const stop = () => {
      setPlaying(false);
  };

  const seek = (sec) => {
      playerRef.current?.seekTo(sec);
  };

  const setVolume = (volume) => {
      setVolume(parseFloat(volume));
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
      <div className="my-video">
          <ReactPlayer 
            ref={playerRef}
            url={videoSrc}
            playing={playing}
            volume={videoVolume}  // 控制按钮
            onProgress={(state) => setPlayedSeconds(state.playedSeconds)}
            onDuration={(dur) => setDuration(dur)}
            controls
            width='100%' 
            height='90%'
          />
        {/* <div style={{ marginTop: '10px' }}>
          <button onClick={() => play(playerRef)}>播放</button>
          <button onClick={() => pause(playerRef)}>暂停</button>
          <button onClick={() => resume(playerRef)}>恢复</button>
          <button onClick={() => stop(setPlaying)}>停止</button>
          <button onClick={() => setVolume(setVolume, data.barCurrentVolume)}>调整音量</button>
          <button onClick={() => seek(playerRef, data.barCurrentProgressSec)}>跳转</button>
        </div> */}
      </div>
  );
});

export default Video;
