import { open } from "@tauri-apps/api/dialog";
import { convertFileSrc } from '@tauri-apps/api/tauri';



export const handleChooseVideo = async (setVideoSrc, data, setData) => {
    // 获取当前文件的状态
    let selectedFile = await open({ multiple: false });
    console.log("selectedFile :",selectedFile);
    setData(prevData => ({
        ...prevData,
        audioSrc: selectedFile,
    }));
    setVideoSrc(convertFileSrc(data.audioSrc));
}




// export const handleProgress = (state, setPlayedSeconds) => {
//     // state.playedSeconds 是当前播放的秒数
//     setPlayedSeconds(state.playedSeconds);
//   };

// export const handleDuration = (dur, setDuration) => {
//     setDuration(dur);
//   };