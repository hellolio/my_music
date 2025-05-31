import styles from "./SplitRow.module.scss";

const SplitRow = ({ left, center, right }) => {
  return (
    <div className={`${styles.threeColumnWrapper}`}>
      <div className={`${styles.left}`}>{left}</div>
      <div className={`${styles.center}`}>{center}</div>
      <div className={`${styles.right}`}>{right}</div>
    </div>
  );
};

export default SplitRow;
