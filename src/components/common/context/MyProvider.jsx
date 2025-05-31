// Context.js
import React, { createContext, useState } from 'react';

export const Context = createContext([]);

export const MyProvider = ({ children }) => {


    const [allSongList, setAllSongList] = useState([]);

  return (
    <Context.Provider value={{ allSongList, setAllSongList }}>
      {children}
    </Context.Provider>
  );
};
