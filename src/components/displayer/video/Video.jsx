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
    handleFullscreen,
  } = useVideoFun(setData, ref);

  return (
    <div className={styles.myVideo} onDoubleClick={() => handleFullscreen()}>
      <ReactPlayer
        ref={playerRef}
        url={videoSrc}
        playing={playing}
        volume={videoVolume}
        onProgress={(state) => setPlayedSeconds(state.playedSeconds)}
        controls={true}
        width="100%"
        height="100%"
      />
    </div>
  );
});

export default Video;
