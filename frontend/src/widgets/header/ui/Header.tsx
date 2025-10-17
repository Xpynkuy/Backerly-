import MyButton from "@shared/ui/button/MyButton";
import styles from "./Header.module.scss";

export const Header = () => {
  return (
    <header className={styles.header}>
      <a href="/" className={styles.logo}>Backerly</a>
      <div className={styles.links}>
        <a href="#statistics">Statistics</a>
        <a href="#how-it-works">How it works</a>
        <a href="#features">Features</a>
      </div>
      <div className={styles.nav__btn}>
        <MyButton size="MEDIUM">SIGN UP</MyButton>
        <MyButton size="MEDIUM">LOG IN</MyButton>
      </div>
    </header>
  );
};
