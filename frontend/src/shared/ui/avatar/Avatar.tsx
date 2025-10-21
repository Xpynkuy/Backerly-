import { type CSSProperties } from "react";
import styles from "./Avatar.module.scss";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: string;
  border?: string;
}

const Avatar = (props: AvatarProps) => {
  const { src, alt, size, border } = props;

  const avatarStyles: CSSProperties = {
    width: size || "100px",
    height: size || "100px",
    border: border || "8px",
  };

  return (
    <img src={src} alt={alt} style={avatarStyles} className={styles.avatar} />
  );
};

export default Avatar;
