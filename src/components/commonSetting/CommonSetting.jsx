import styles from "./CommonSetting.module.scss";
import {getCommonSettingFun} from './CommonSettingFun'

import MyButton from "@/components/common/button/MyButton";

export default function CommonSetting({settingData, setSettingData, readWindowState, writeWindowState}) {

    const [
      selectedRemeberSize, setSelectedRemeber,
      selectedDongan, setSelectedDongan,
      saveSetting
    ] = getCommonSettingFun(settingData, setSettingData, readWindowState, writeWindowState);

    return (
      <div>
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
  )
}