import { useTranslation } from "react-i18next";
import styles from "./NotFoundPage.module.scss";
import MyButton from "@shared/ui/button/MyButton";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.error}>404</h1>
        <h2 className={styles.title}>{t("Page not found")}</h2>
        <span className={styles.desc}>{t("Sorry, the page not found.")}</span>
        <Link to='/' className={styles.link}>
          <MyButton size="AUTO">{t("TO HOME PAGE")}</MyButton>
        </Link>
      </div>
    </div>
  );
};
