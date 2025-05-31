import styles from "./ModalCom.module.scss";
import React, { useEffect, useRef } from "react";

export default function ModalCom({
  visible,
  setVisible,
  parentRef,
  style,
  children,
}) {
  const ModalComRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        visible &&
        ModalComRef.current &&
        !ModalComRef.current.contains(event.target) &&
        parentRef.current &&
        !parentRef.current.contains(event.target)
      ) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, parentRef]);

  return (
    <div
      className={`${style} ${styles.modal} ${visible ? styles.visible : ""}`}
    >
      <div className={styles.modalContent} ref={ModalComRef}>
        {children}
      </div>
    </div>
  );
}
