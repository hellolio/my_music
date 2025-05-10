import React from 'react';
import styles from './SplitRow.module.scss';

const SplitRow = ({ left, leftStyle,  center, centerStyle, right, righStyle }) => {
  return (
    <div className={styles.container}>
      <div className={`${leftStyle} ${styles.left}`}>{left}</div>
      <div className={`${centerStyle} ${styles.center}`}>{center}</div>
      <div className={`${righStyle} ${styles.right}`}>{right}</div>
    </div>
  );
};

export default SplitRow;