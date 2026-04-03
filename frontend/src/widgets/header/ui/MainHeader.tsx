import { DropDown } from "@features/dropDown";
import { NotificationBell } from "@features/notifications";
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
        <NotificationBell />
        <DropDown />
      </div>
    </header>
  );
};

export default MainHeader;
