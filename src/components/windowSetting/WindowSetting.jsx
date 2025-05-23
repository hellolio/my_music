import styles from './WindowSetting.module.scss';
import { useState, useEffect, useRef  } from "react";
import { appWindow } from '@tauri-apps/api/window';

import { SettingList } from "@/components/settingList/SettingList";
import { ThemeList } from "@/components/themeList/ThemeList";
import { SearchedList } from "@/components/searchedList/SearchedList";
import { HelpList } from "@/components/helpList/HelpList";
import SplitRow from "@/components/common/splitRow/SplitRow";
import MyButton from "@/components/common/button/MyButton";
import MyInput from "@/components/common/input/MyInput";
import { Context } from '@/components/common/context/MyProvider';
import ModalCom from "@/components/common/modalCom/ModalCom";


export const WindowSetting = ({data, setData, allSongList, setAllSongList, setIsDesktopMode}) => {

    const settinglistRef = useRef(null);

    const [showSetting, setShowSetting] = useState(false);
    const [showThemeList, setShowThemeList] = useState(false);
    const [showSearchedList, setShowSearchedList] = useState([]);
    const [showHelpList, setShowHelpList] = useState(false);
 
    const [isMaximize, setisMaximize] = useState(false);
  
    const minWindow = () =>{
      appWindow.minimize();
    }
    const maxWindow = () =>{
      appWindow.toggleMaximize();
      
    }
    const closeWindow = () =>{
      appWindow.close();
    }
  
  appWindow.onResized(() => {
    appWindow.isMaximized().then((maximized) => {
      setisMaximize(maximized);
      // 根据状态切换按钮图标
    });
  });
  
  
  const [searchKey, setSearchKey] = useState('');

  const [searchedListRst, setSearchedListRst] = useState([]);
  
  const searchOnFocus = () => {
    if (searchKey != "" && searchedListRst.length > 0){
      setShowSearchedList(true);
    }
  }

  useEffect(() => {
    if (searchKey === "") {
      setShowSearchedList(false);
      setSearchedListRst([]);
      return;
    }
    console.log("allSongList:",allSongList);

    const songs =  allSongList.flatMap((items,index) =>
      items.songs.filter(song => song.title.includes(searchKey) || song.author.includes(searchKey)).map(item=>({...item, playlistId: items.id}))
    ).slice(0,5);

    console.log("songs:",songs);

    if (songs.length === 0) {
      setShowSearchedList(false);
      setSearchedListRst([]);
      return;
    }
    setSearchedListRst(songs);

    setShowSearchedList(true);

  }, [searchKey]);

  return (
        <div id="drag-container" ref={settinglistRef}
          className={styles.window}>
          <SplitRow
            left={
              <div  className={styles.windowControlsLeft}>
                <MyButton 
                  callFun={() => setShowSetting(!showSetting)}
                  msg={'⚙'}
                  isConfirm={true}
                  style={styles.setting}
                />
                <MyButton 
                  callFun={() => setShowThemeList(!showThemeList)}
                  msg={'👕'}
                  isConfirm={true}
                  style={styles.setting}
                />
                <MyButton 
                  callFun={() => setShowHelpList(!showHelpList)}
                  msg={'💡'}
                  isConfirm={true}
                  style={styles.setting}
                />
              </div>
            }
            center={
              <div className={styles.windowControlsCenter}>
                  <MyInput 
                    type={'text'}
                    value={searchKey}
                    setValue={setSearchKey}
                    placeholder="搜索"
                    style={styles.searchKeyInput}
                    onFocus={searchOnFocus}
                  />
              </div>
            }
            right={
              <div className={styles.windowControlsRight}>
                <MyButton 
                  callFun={() => setIsDesktopMode(true)}
                  msg={'↬'}
                  isConfirm={true}
                  style={styles.setting}
                />
                <MyButton 
                  callFun={() => minWindow()}
                  msg={'-'}
                  isConfirm={true}
                  style={styles.setting}
                />
                <MyButton 
                  callFun={() => maxWindow()}
                  msg={isMaximize ? '◱' : '□'}
                  isConfirm={true}
                  style={styles.setting}
                />
                <MyButton 
                  callFun={() => closeWindow()}
                  msg={'×'}
                  isConfirm={true}
                  style={styles.setting}
                />
            </div>
            }
          />
        
        <ModalCom
          visible={showSetting}
          setVisible={setShowSetting}
          parentRef={settinglistRef}
          style={styles.settingList}
          children={
            <SettingList
              data={data}
              setData={setData}
            />
          }
        />

        <ModalCom
          visible={showThemeList}
          setVisible={setShowThemeList}
          parentRef={settinglistRef}
          style={styles.themeList}
          children={
            <ThemeList
              data={data}
              setData={setData}
            />
          }
        />

        <ModalCom
          visible={showHelpList}
          setVisible={setShowHelpList}
          parentRef={settinglistRef}
          style={styles.helpList}
          children={
            <HelpList
              data={data}
              setData={setData}
            />
          }
        />

        <ModalCom 
            visible={showSearchedList}
            setVisible={setShowSearchedList}
            parentRef={settinglistRef}
            style={styles.songSearchList}
            children={
              <SearchedList 
                data={data}
                setData={setData}
                searchedListRst={searchedListRst}
              />
            }
        />
    </div>

    )
}