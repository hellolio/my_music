// Context.js
import React, { createContext, useState } from 'react';

export const Context = createContext([]); // 默认值是 light

export const MyProvider = ({ children }) => {

    // 所有歌单list
    const [allSongList, setAllSongList] = useState([]);

  return (
    <Context.Provider value={{ allSongList, setAllSongList }}>
      {children}
    </Context.Provider>
  );
};
