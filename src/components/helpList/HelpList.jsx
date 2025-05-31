import { useRef } from "react";
import styles from "./HelpList.module.scss";
import { open } from "@tauri-apps/api/shell";

export const HelpList = ({ data, setData }) => {
  const SettingRef = useRef(null);

  const gotoInter = async (link) => {
    await open(link);
  };

  return (
    <div ref={SettingRef}>
      <ul className={styles.list}>
        <li
          className={styles.row}
          onClick={() => gotoInter("https://github.com/hellolio/my_music")}
        >
          welcome
        </li>
        <li
          className={styles.row}
          onClick={() =>
            gotoInter("https://github.com/hellolio/my_music/releases")
          }
        >
          show release Notes
        </li>
        <li
          className={styles.row}
          onClick={() =>
            gotoInter("https://github.com/hellolio/my_music/issues")
          }
        >
          report issue
        </li>
        <li
          className={styles.row}
          onClick={() =>
            gotoInter(
              "https://github.com/hellolio/my_music/blob/master/LICENSE"
            )
          }
        >
          view license
        </li>
        <li
          className={styles.row}
          onClick={() =>
            gotoInter("https://github.com/hellolio/my_music/releases")
          }
        >
          update
        </li>
      </ul>
    </div>
  );
};
