import styles from "./ModalComFloat.module.scss";
import ReactDOM from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';


export default function ModalComFloat({visible, setVisible, panelRef, children}) {

    const ModalComFloatRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (visible && ModalComFloatRef.current && !ModalComFloatRef.current.contains(event.target) &&
          panelRef.current && !panelRef.current.contains(event.target)) {
            setVisible(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [visible, panelRef]);


    return ReactDOM.createPortal(
        
      <div className={`${styles.modal} ${visible ? styles.visible : ''}`}
      >
        <div className={styles.modalContent} ref={ModalComFloatRef}>
          {children}
        </div>
      </div>,
        document.body
    )
}