import styles from "./CommonSetting.module.scss";
import ReactDOM from 'react-dom';
import {getCommonSettingFun} from './CommonSettingFun'

import MyButton from "@/components/common/button/MyButton";

export default function CommonSetting({commonSetting, setCommonSetting, data, setData, panelRef, settingData, setSettingData, readWindowState, writeWindowState}) {

    const [
      selectedRemeberSize, setSelectedRemeber,
      selectedDongan, setSelectedDongan,
      CommonSettingRef,
      saveSetting
    ] = getCommonSettingFun(commonSetting, setCommonSetting, data, setData, panelRef, settingData, setSettingData, readWindowState, writeWindowState);

    return ReactDOM.createPortal(
      <div id="lyricModal" className={`${styles.modal} ${commonSetting ? styles.visible : ''}`}
      >
        <div className={styles.modalContent} ref={CommonSettingRef}>
              <div className={`${styles.postControls}`}>
                <div className={styles.left}
                  onClick={() =>setSelectedRemeber(!selectedRemeberSize)}
                >
                <input
                  type="checkbox"
                  readOnly
                  checked={selectedRemeberSize}
                />
                  <label
                    className={styles.savePathLabel}
                  >记住桌面
                  </label>
                </div>
              </div>  
              <div className={`${styles.postControls}`}>
                <div className={styles.left}
                  onClick={() => setSelectedDongan(!selectedDongan)}
                >
                <input
                  type="checkbox"
                  readOnly
                  checked={selectedDongan}
                />
                  <label
                    className={styles.savePathLabel}
                  >动感光波
                  </label>
                </div>
              </div>  

              <div className={`${styles.postControls}`}>
                <div className={`${styles.rightControls}`}>
                  <MyButton 
                    callFun={() => saveSetting()}
                    msg={'应用'}
                    isConfirm={true}
                  />
                </div>
              </div>
          </div>
      </div>,
        document.body // 指定挂载点
    )
}