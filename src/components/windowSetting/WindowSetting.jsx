import styles from './WindowSetting.module.scss';
import { useState, useEffect, useRef, useContext  } from "react";
import { appWindow, PhysicalPosition  } from '@tauri-apps/api/window';

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
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    console.log("allSongList:",allSongList);
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
              (<div>
                <ul>
                  <li>歌曲1</li>
                  <li>歌曲2</li>
                  <li>歌曲3</li>
                </ul>
              </div>)
            }
        />
    </div>

    )
}