// 切换收藏状态
export const collectClick = (data, setData) => {
    setData(prevData => ({
        ...prevData,
        isCollect: !data.isCollect
    }));
};

// 切换关注状态
export const followClick = (data, setData) => {
    console.log("data test:",data);
    setData(prevData => ({
        ...prevData,
        isFollow: !data.isFollow
    }));
};