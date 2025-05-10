import React, { useEffect, useRef, useState } from 'react';
import styles from "./HelpList.module.scss";



export const HelpList = ({data, setData}) => {

    const SettingRef = useRef(null);
    
    return (
      <div ref={SettingRef}>
        <ul className={styles.list}>
            <li className={styles.row}>welcome</li>
            <li className={styles.row}>show release Notes</li>
            <li className={styles.row}>report issue</li>
            <li className={styles.row}>view license</li>
            <li className={styles.row}>乞讨</li>
            <li className={styles.row}>about</li>
        </ul>
      </div>
    )
}