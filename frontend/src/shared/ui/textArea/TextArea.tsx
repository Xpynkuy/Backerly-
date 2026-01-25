import type { CSSProperties } from "react";
import styles from "./TextArea.module.scss";

interface TextAreaProps {
  placeholder?: string;
  value: string;
  width?: string;
  height?: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}

const TextArea = (props: TextAreaProps) => {
  const { placeholder, value, onChange, width, height } = props;

  const TextAreaStyles: CSSProperties = {
    width: width || "100px",
    height: height || "200px",
  };

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={TextAreaStyles}
      className={styles.textArea}
    />
  );
};

export default TextArea;
