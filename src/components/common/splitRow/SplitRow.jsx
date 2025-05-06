import React from 'react';
import styles from './SplitRow.module.scss';

const SplitRow = ({ left, right }) => {
  return (
    <div className={styles.container}>
      <div className={styles.left}>{left}</div>
      <div className={styles.right}>{right}</div>
    </div>
  );
};

export default SplitRow;