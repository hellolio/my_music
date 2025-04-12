
const utils = {

    formatTime: (seconds) => {
        const minutes = Math.floor(seconds / 60); // 获取分钟数
        const remainingSeconds = seconds % 60; // 获取剩余的秒数
    
        // 返回格式化的时间，确保秒数为两位数
        return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
    },

    calculatePercentage: (part, total) => {
        if (total === 0) {
            return 0;  // 防止除以零
        }
        return Math.round((part / total) * 100);
    }
}

export default utils;