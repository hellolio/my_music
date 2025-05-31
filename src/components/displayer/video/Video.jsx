import ReactPlayer from "react-player";
import { forwardRef } from "react";
import styles from "./Video.module.scss";
import { useVideoFun } from "./VideoFun";

const Video = forwardRef(({ data, setData }, ref) => {
  const {
    playerRef,
    videoSrc,
    playing,
    videoVolume,
    setPlayedSeconds,
    setDuration,
  } = useVideoFun(setData, ref);

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
        width="100%"
        height="90%"
      />
    </div>
  );
});

export default Video;
