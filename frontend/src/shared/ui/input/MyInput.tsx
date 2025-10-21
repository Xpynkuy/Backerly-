import type React from "react";
import styles from "./MyInput.module.scss";
import { useState, type FC } from "react";
import { EyeClosed, EyeIcon } from "lucide-react";

interface MyInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  showPasswordToggle?: boolean;
}

const MyInput: FC<MyInputProps> = ({
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const shouldShowToggle = showPasswordToggle && isPassword;
  const inputType = shouldShowToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={styles.inputWrapper}>
      <input
        className={styles.input}
        value={value}
        onChange={onChangeHandler}
        placeholder={placeholder}
        type={inputType}
        required={required}
      />
      {shouldShowToggle && (
        <button
          type="button"
          className={styles.toggleButton}
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? <EyeIcon /> : <EyeClosed />}
        </button>
      )}
    </div>
  );
};

export default MyInput;
