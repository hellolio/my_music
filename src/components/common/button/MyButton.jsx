import styles from './MyButton.module.scss';

export default function MyButton({callFun,callDoubleFun, msg, isConfirm, style}) {

  return (
        <button 
          className={`${styles.myButton} ${style? style : isConfirm ? styles.confirm: styles.cancle}`} 
          onClick={callFun} 
          onDoubleClick={callDoubleFun}
        >{msg}
        </button>
  );
}
