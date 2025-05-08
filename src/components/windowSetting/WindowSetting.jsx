import styles from './WindowSetting.module.scss';
import { useState, useEffect, useRef, useContext  } from "react";
import { appWindow } from '@tauri-apps/api/window';

import * as utils from "../../common/utils"

import { SettingList } from "@/components/settingList/SettingList";
import SplitRow from "@/components/common/splitRow/SplitRow";
import MyButton from "@/components/common/button/MyButton";
import MyInput from "@/components/common/input/MyInput";
import { Context } from '../common/context/MyProvider';
import ModalCom from "@/components/common/modalCom/ModalCom";


export const WindowSetting = ({data, setData}) => {

    const settinglistRef = useRef(null);

    const [showSetting, setShowSetting] = useState(false);
 
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
      console.log('是否最大化：', maximized);
      setisMaximize(maximized);
      // 根据状态切换按钮图标
    });
  });
  
  
  const [searchKey, setSearchKey] = useState('');

  const { allSongList, setAllSongList } = useContext(Context);
  const [searchedList, setSearchedList] = useState([]);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (searchKey === "") {
      setVisible(false);
      setSearchedList([]);
      return;
    }

    const songs =  allSongList.flatMap(item =>
      item.songs.filter(song => song.title.includes(searchKey) || song.author.includes(searchKey))
    ).slice(0,5);

    if (songs.length === 0) {
      setVisible(false);
      setSearchedList([]);
      return;
    }
    setSearchedList(songs);

    setVisible(true);

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
                  callFun={() => {alert("开发中")}}
                  msg={'👕'}
                  isConfirm={true}
                  style={styles.setting}
                />
                <MyButton 
                  callFun={() => {alert("暂未开发")}}
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
                    style={styles.myInput}
                  />
              </div>
            }
            right={
              <div className={styles.windowControlsRight}>
                <MyButton 
                  callFun={() => {alert("桌面模式暂未开发")}}
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
              settinglistRef={settinglistRef}
              data={data}
              setData={setData}
            />
          }
        />
          

        <ModalCom 
            visible={visible}
            setVisible={setVisible}
            parentRef={settinglistRef}
            style={styles.songSearchList}
            children={
              (<ul>
                  {searchedList.map((song, index) => (
                    <li
                      key={index}
                      onDoubleClick={() => utils.playMusicFromList(song, data, setData)}
                    >
                      <span className={styles.index}>{`${index + 1}-${song.title}-${song.total_duration}`}</span>
                    </li>
                  ))}
              </ul>)
            }
        />
    </div>

    )
}