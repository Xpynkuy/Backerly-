import type { CSSProperties } from "react";
import { forwardRef } from "react";
import styles from "./TextArea.module.scss";

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  width?: string;
  height?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  error?: string;
  name?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => {
    const { placeholder, value, onChange, width, height, error, name } = props;

    const TextAreaStyles: CSSProperties = {
      width: width || "100px",
      height: height || "200px",
    };

    return (
      <div className={styles.container}>
        <textarea
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={TextAreaStyles}
          className={`${styles.textArea} ${error ? styles.textAreaError : ""}`}
          name={name}
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;