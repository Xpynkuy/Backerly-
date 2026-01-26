import { DropDown } from "@features/dropDown";
import styles from "./Header.module.scss";
import { LangSwitch } from "@features/langSwitch";

const MainHeader = () => {
  return (
    <header className={styles.header}>
      <a href="/" className={styles.logo}>
        Backerly
      </a>
      <div className={styles.nav__btn}>
        <LangSwitch />
        <DropDown />
      </div>
    </header>
  );
};

export default MainHeader;
