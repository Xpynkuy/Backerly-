import type React from "react";
import styles from "./MyInput.module.scss";
import { useState, forwardRef, memo } from "react";
import { EyeClosed, EyeIcon } from "lucide-react";

interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showPasswordToggle?: boolean;
  error?: string;
}

const MyInput = forwardRef<HTMLInputElement, MyInputProps>(
  (
    {
      placeholder,
      type = "text",
      required = false,
      showPasswordToggle = false,
      error,
      ...rest
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const shouldShowToggle = showPasswordToggle && isPassword;
    const inputType = shouldShowToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className={styles.container}>
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            className={`${styles.input} ${error ? styles.inputError : ""}`}
            placeholder={placeholder}
            type={inputType}
            required={required}
            {...rest}
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
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  },
);

MyInput.displayName = "MyInput";

export default memo(MyInput);
