import styles from "./TextArea.module.scss";

interface TextAreaProps {
  placeholder?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}

const TextArea = (props: TextAreaProps) => {
  const { placeholder, value, onChange } = props;
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={styles.textArea}
    />
  );
};

export default TextArea;
