import React, { useEffect, useRef, useState } from 'react';
import styles from "./ThemeList.module.scss";



export const ThemeList = ({data, setData}) => {

    const SettingRef = useRef(null);
    
    return (
      <div ref={SettingRef}>
        <ul className={styles.list}>
            <li className={styles.row}>皮肤1</li>
            <li className={styles.row}>皮肤2</li>
            <li className={styles.row}>黑暗模式</li>
        </ul>
      </div>
    )
}