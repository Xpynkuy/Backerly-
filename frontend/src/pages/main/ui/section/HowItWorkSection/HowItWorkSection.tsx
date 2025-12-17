import { useTranslation } from "react-i18next";
import styles from "./HowItWork.module.scss";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";

const HowItWorkSection = () => {
  const {t} = useTranslation()

  return (
    <section id="how-it-works" className={styles.SectionContainer}>
      <div className={styles.title}>
        <span>{t('How it works?')}</span>
        <h2>{t('Everything’s super easy')}</h2>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <img
            src="/assets/1-pic.D0Dxt1l7.png"
            alt="Step 1"
          />
          <span className={styles.step}>{t('Step 1')}</span>
          <h3 className={styles.cardTitle}>
            {renderWithLineBreaks(t('workSection.title1'))}
          </h3>
          <span className={styles.cardDesc}>
            {renderWithLineBreaks(t('workSection.desc1'))}
          </span>
        </div>
        <div className={styles.card}>
          <img
            src="/assets/2-pic.CYkcJeEA.png"
            alt="Step 2"
          />
          <span className={styles.step}>{t('Step 2')}</span>
          <h3 className={styles.cardTitle}>
            {renderWithLineBreaks(t('workSection.title2'))}
          </h3>
          <span className={styles.cardDesc}>
            {renderWithLineBreaks(t('workSection.desc2'))}
          </span>
        </div>
        <div className={styles.card}>
          <img
            src="/assets/3-pic.DcCb6ZdZ.png"
            alt="Step 3"
          />
          <span className={styles.step}>{t('Step 3')}</span>
          <h3 className={styles.cardTitle}>
            {renderWithLineBreaks(t('workSection.title3'))}
          </h3>
          <span className={styles.cardDesc}>
            {renderWithLineBreaks(t('workSection.desc3'))}
          </span>
        </div>
      </div>
    </section>
  );
};

export default HowItWorkSection;
