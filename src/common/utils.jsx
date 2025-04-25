

export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60); // 获取分钟数
    const remainingSeconds = seconds % 60; // 获取剩余的秒数

    // 返回格式化的时间，确保秒数为两位数
    return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
}

export const calculatePercentage = (part, total) => {
    if (total === 0) {
        return 0;  // 防止除以零
    }
    return Math.round((part / total) * 100);
}

export const isMusic = (filename) => {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv', 'wmv'];
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    const isAudioFile = audioExtensions.includes(ext);
    if (isAudioFile) {
        console.log('这是音频文件');
        return true;
    } else if (videoExtensions.includes(ext)) {
        console.log('这是视频文件');
        return false;
    } else {
        console.log('未知类型');
        return false;
    }
}
