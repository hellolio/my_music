import styles from './MyInput.module.scss';

export default function MyInput({type, value, setValue, placeholder}) {

  return (
    <input
    className={styles.myInput}
    type={type}
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder={placeholder}
    />
  );
}
