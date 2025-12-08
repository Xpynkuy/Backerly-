import { Link } from "react-router-dom";
import MyButton from "@shared/ui/button/MyButton";
import styles from "./Header.module.scss";
import { LangSwitch } from "@features/langSwitch";
import { useTranslation } from "react-i18next";

const GuestHeader = () => {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <a href="/" className={styles.logo}>
        Backerly
      </a>
      <div className={styles.links}>
        <a href="#statistics">{t("Statistics")}</a>
        <a href="#how-it-works">{t("How it works")}</a>
        <a href="#features">{t("Features")}</a>
      </div>

      <div className={styles.nav__btn}>
        <LangSwitch />
        <Link to="/register" className={styles.nav__link}>
          <MyButton size="AUTO">{t('SIGN UP')}</MyButton>
        </Link>
        <Link to="/login" className={styles.nav__link}>
          <MyButton size="AUTO">{t('LOG IN')}</MyButton>
        </Link>
      </div>
    </header>
  );
};

export default GuestHeader;
