import styles from './MyInput.module.scss';

export default function MyInput({type, value, setValue, placeholder, style}) {

  return (
    <input
      className={`${styles.myInput} ${style}`}
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
    />
  );
}
