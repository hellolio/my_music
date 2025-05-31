import styles from "./ChangeTheme.module.scss";
import { useState } from "react";
import { selectSavePath, saveSetting } from "./ChangeThemeFun";

import MyButton from "@/components/common/button/MyButton";
import MyInput from "@/components/common/input/MyInput";
export default function ChangeTheme({
  data,
  setData,
  settingData,
  setSettingData,
}) {
  const [savePath, setSavePath] = useState(settingData.coverImagePath);
  const [selected, setSelected] = useState(settingData.useMusicCover);

  const [backColor, setBackColor] = useState("#505252b8");
  const [backAlpha, setBackAlpha] = useState(settingData?.backAlpha ?? 0.5);
  const [backdropFilter, setBackdropFilter] = useState(
    settingData?.backdropFilter ?? 10
  );

  return (
    <div>
      <div className={`${styles.postControls}`}>
        {}
        <div className={`${styles.leftControls} ${styles.left}`}>
          <MyButton
            callFun={() => selectSavePath(setSavePath)}
            msg={"设置背景图片"}
            isConfirm={true}
          />
          <MyInput
            type={"text"}
            value={savePath}
            setValue={setSavePath}
            placeholder="输入路径"
          />
        </div>
      </div>

      <div className={`${styles.postControls}`}>
        <div className={styles.left} onClick={() => setSelected(!selected)}>
          <input type="checkbox" readOnly checked={selected} />

          <label htmlFor="savePath" className={styles.savePathLabel}>
            将当前歌曲的专辑封面设置为背景
          </label>
        </div>
        <label htmlFor="" className={styles.savePathLabelblack}></label>
      </div>
      <div className={`${styles.postControls}`}>
        <div className={`${styles.leftControls} ${styles.left}`}>
          选择背景颜色:{" "}
          <input
            className={styles.hiddenColorInput}
            type="color"
            color={backColor}
            onChange={(e) => setBackColor(e.target.value)}
          />
        </div>
      </div>
      <div className={`${styles.postControls}`}>
        <div className={`${styles.leftControls} ${styles.left}`}>
          背景不透明度:
          <input
            id="backAlpha"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={backAlpha}
            onChange={(e) => setBackAlpha(parseFloat(e.target.value))}
          />
        </div>
      </div>
      <div className={`${styles.postControls}`}>
        <div className={`${styles.leftControls} ${styles.left}`}>
          背景高斯模糊度:
          <input
            id="backAlpha"
            type="range"
            min="0"
            max="50"
            step="1"
            value={backdropFilter}
            onChange={(e) => setBackdropFilter(parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className={`${styles.postControls}`}>
        <div className={`${styles.rightControls}`}>
          <MyButton
            callFun={() =>
              saveSetting(
                setSettingData,
                savePath,
                selected,
                backColor,
                backAlpha,
                backdropFilter
              )
            }
            msg={"应用"}
            isConfirm={true}
          />
        </div>
      </div>
    </div>
  );
}
