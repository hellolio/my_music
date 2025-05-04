import styles from './MyButton.module.scss';

export default function MyButton({callFun, msg, isConfirm}) {

  return (
        <button className={`${styles.myButton} ${isConfirm ? styles.confirm: styles.cancle}`} onClick={callFun}>{msg}</button>
  );
}
