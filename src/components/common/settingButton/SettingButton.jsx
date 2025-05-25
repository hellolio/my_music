import styles from './SettingButton.module.scss';

export default function SettingButton({callFun,callDoubleFun, msg, style}) {

  return (
        <button 
          className={`${style} ${styles.setting} ${styles.myButton}`} 
          onClick={callFun} 
          onDoubleClick={callDoubleFun}
        >{msg}
        </button>
  );
}
