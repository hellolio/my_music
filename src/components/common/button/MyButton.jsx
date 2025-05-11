import styles from './MyButton.module.scss';

export default function MyButton({callFun,callDoubleFun, msg, isConfirm, style}) {

  return (
        <button 
          className={`${style} ${isConfirm ? styles.confirm: styles.cancle} ${styles.myButton}`} 
          onClick={callFun} 
          onDoubleClick={callDoubleFun}
        >{msg}
        </button>
  );
}
