import type { ReactNode } from "react";
import styles from "./MyButton.module.scss";

const ButtonSize = {
  AUTO: 'auto',
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  FULL: "full",
} as const;

const ButtonColor = {
  PRIMARY: "primary",
  ACCENT: "accent",
  GREEN: "green",
  GRAY: "gray",
  RED: "red",
  TRANSPARENT: 'transparent',
} as const;

interface ButtonProps {
  children?: ReactNode;
  size?: keyof typeof ButtonSize;
  color?: keyof typeof ButtonColor;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const MyButton = (props: ButtonProps) => {
  const {
    children,
    size = "MEDIUM",
    color = "PRIMARY",
    className = "",
    onClick,
    disabled = false,
    type = "button",
  } = props;

  const sizeValue = ButtonSize[size];
  const colorValue = ButtonColor[color];

  const buttonClasses = `
    ${styles.btn} 
    ${styles[`btn--${sizeValue}`]} 
    ${styles[`btn--${colorValue}`]} 
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};

export default MyButton;
