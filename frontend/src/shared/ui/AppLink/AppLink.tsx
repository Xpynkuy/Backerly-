import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./AppLink.module.scss";

interface AppLinkProps {
  children: ReactNode;
  to: string;
  className?: string;
  icon?: ReactNode;
}

export const AppLink = (props: AppLinkProps) => {
  const { children, to, className, icon } = props;
  return (
    <Link to={to} className={styles.AppLink}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </Link>
  );
};
