import React, { useState } from "react";
import styles from "./ShowMsg.module.scss";
import MyButton from "@/components/common/button/MyButton";

export default function ShowMsg({
  showMsgParam,
  inputValue,
  setInputValue,
  showDialog,
  setShowDialog,
  callFun,
  callFunParam,
}) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleCancle = () => {
    setFadeOut(true);
    setShowDialog(false);
  };

  return (
    <div>
      <div
        className={`${styles.dialogOverlay} ${
          fadeOut ? styles.dialogOverlayFadeOut : ""
        }`}
        onClick={() => handleCancle()}
      />
      <div
        className={`${styles.dialog} ${fadeOut ? styles.dialogFadeOut : ""}`}
      >
        <h3>{showMsgParam.title}</h3>
        {showMsgParam.isInput && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={showMsgParam.placeholder}
          />
        )}
        <div className={styles.dialogButtons}>
          <MyButton
            callFun={() => callFun(callFunParam)}
            msg={"确认"}
            isConfirm={true}
          />
          <MyButton
            callFun={() => handleCancle()}
            msg={"取消"}
            isConfirm={false}
          />
        </div>
      </div>
    </div>
  );
}
