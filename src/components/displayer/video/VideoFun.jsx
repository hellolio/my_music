import { open } from "@tauri-apps/api/dialog";
import { convertFileSrc } from '@tauri-apps/api/tauri';



export const handleChooseVideo = async (setVideoSrc, data, setData) => {

    let selectedFile = await open({ multiple: false });
    setData(prevData => ({
        ...prevData,
        audioSrc: selectedFile,
    }));
    setVideoSrc(convertFileSrc(data.audioSrc));
}




// export const handleProgress = (state, setPlayedSeconds) => {
//
//     setPlayedSeconds(state.playedSeconds);
//   };

// export const handleDuration = (dur, setDuration) => {
//     setDuration(dur);
//   };