import styles from "./FindLyrics.module.scss";
import * as utils from "../../common/utils";
import MyButton from "@/components/common/button/MyButton";
import MyInput from "@/components/common/input/MyInput";
import { useFindLyricsFun } from "./FindLyricsFun";

export default function FindLyrics({ data, setData }) {
  const {
    selectSavePath,
    saveLyrics,
    searchLyrics,
    getDirectoryPath,
    savePath,
    setSavePath,
    selected,
    setSelected,
    songTitle,
    setSongTitle,
    resultList,
    setResultList,
    selectedRow,
    setSelectedRow,
  } = useFindLyricsFun(data, setData);

  return (
    <div>
      <div className={styles.search}>
        <h3>查找歌词</h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          <MyInput
            type={"text"}
            value={songTitle}
            setValue={setSongTitle}
            placeholder="输入歌名"
          />
          <MyButton
            callFun={() => searchLyrics(songTitle, setResultList)}
            msg={"检索"}
            isConfirm={true}
          />
        </div>
      </div>
      <div className={styles.resultListWrapper}>
        {}
        <table className={styles.resultListTable}>
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "left" }}>歌名</th>
              <th style={{ width: "100px", textAlign: "center" }}>信息</th>
              <th style={{ width: "50px", textAlign: "center" }}>作者</th>
              <th style={{ width: "30px", textAlign: "right" }}>时长</th>
            </tr>
          </thead>
        </table>

        {}
        <div className={styles.resultList}>
          <table className={styles.resultListTable}>
            <tbody>
              {resultList.map((result, index) => (
                <tr
                  key={index}
                  className={`${styles.resultRow} ${
                    selectedRow === index ? styles.selectedRow : ""
                  }`}
                  onClick={() => setSelectedRow(index)}
                >
                  <td
                    className={styles.rowOverHidden}
                    style={{ width: "60px", textAlign: "left" }}
                  >
                    {result.title}
                  </td>
                  <td
                    className={styles.rowOverHidden}
                    style={{ width: "100px", textAlign: "center" }}
                  >
                    {result.subtitle}
                  </td>
                  <td
                    className={styles.rowOverHidden}
                    style={{ width: "50px", textAlign: "center" }}
                  >
                    {result.artist}
                  </td>
                  <td
                    className={styles.rowOverHidden}
                    style={{ width: "30px", textAlign: "right" }}
                  >
                    {utils.formatTime(result.duration)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${styles.postControls}`}>
        {}
        <div className={styles.leftControls}>
          <MyButton
            callFun={() => selectSavePath(setSavePath)}
            msg={"选择保存路径"}
            isConfirm={true}
          />
          <MyInput
            type={"text"}
            value={savePath}
            setValue={setSavePath}
            placeholder="输入保存路径"
          />
        </div>
      </div>

      <div className={`${styles.postControls}`}>
        <div
          className={styles.leftControls}
          onClick={() => setSelected(!selected)}
        >
          <input type="checkbox" readOnly checked={selected} />

          <label htmlFor="savePath" className={styles.savePathLabel}>
            设置为当前歌曲的歌词
          </label>
        </div>
        <label htmlFor="" className={styles.savePathLabel}></label>

        <div className={`${styles.rightControls}`}>
          <MyButton
            callFun={() =>
              saveLyrics(
                resultList,
                selectedRow,
                savePath,
                selected,
                data,
                setData,
                songTitle
              )
            }
            msg={"保存"}
            isConfirm={true}
          />
        </div>
      </div>
    </div>
  );
}
