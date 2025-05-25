import React from 'react';
import styles from './SplitRow.module.scss';

const SplitRow = ({ gridCols, left, leftStyle,  center, centerStyle, right, rightStyle }) => {
  return (
    <div className={`${styles.container}`}
    style={{ '--grid-cols': gridCols }}
    >
      <div className={`${leftStyle} ${styles.left}`}>{left}</div>
      <div className={`${centerStyle} ${styles.center}`}>{center}</div>
      <div className={`${rightStyle} ${styles.right}`}>{right}</div>
    </div>
  );
};

export default SplitRow;