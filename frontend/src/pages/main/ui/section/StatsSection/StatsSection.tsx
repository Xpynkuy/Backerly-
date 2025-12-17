import { useTranslation } from "react-i18next";
import styles from "./StatsSection.module.scss";

const StatsSection = () => {
  const { t } = useTranslation();
  return (
    <section id="statistics" className={styles.statsContainer}>
      <div className={styles.stats}>
        <div className={styles.content}>
          <div className={styles.title}>1M+</div>
          <span className={styles.desc}>
            {t("section.subs")}
          </span>
        </div>
        <div className={styles.content}>
          <div className={styles.title}>50K+</div>
          <span className={styles.desc}>{t("section.creators")}</span>
        </div>
        <div className={styles.content}>
          <div className={styles.title}>20M+</div>
          <span className={styles.desc}>{t("section.payments")}</span>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
