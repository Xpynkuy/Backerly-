import {
  Banknote,
  BanknoteArrowUp,
  Coins,
  Percent,
  Send,
  Star,
} from "lucide-react";
import styles from "./FeaturesSection.module.scss";
import { useTranslation } from "react-i18next";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";

const FeaturesSection = () => {
  const {t} = useTranslation()
  return (
    <section id="features" className={styles.featuresContainer}>
      <div className={styles.title}>
        <span>{t('What we offer')}</span>
        <h1>{t("Everything you need to start earning")}</h1>
      </div>

      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <Banknote size={32} color="#7272D1" />
          <span className={styles.cardTitle}>{renderWithLineBreaks(t("card.title1"))}</span>
          <span className={styles.cardDesc}>
           {renderWithLineBreaks(t("card.desc1"))}
          </span>
          <img src="/assets/withdraw.BaeUhuf6.png" alt="withdraw" />
        </div>
        <div className={styles.card}>
          <Star size={32} color="#7272D1" />
          <span className={styles.cardTitle}>{renderWithLineBreaks(t("card.title2"))}</span>
          <span className={styles.cardDesc}>
            {renderWithLineBreaks(t("card.desc2"))}
          </span>
          <img src="/assets/subscriptions.6u62L5l-.png" alt="subscriptions" />
        </div>
        <div className={styles.card}>
          <Percent size={32} color="#7272D1" />
          <span className={styles.cardTitle}>{renderWithLineBreaks(t("card.title3"))}</span>
          <span className={styles.cardDesc}>
            {renderWithLineBreaks(t("card.desc3"))}
          </span>
          <img src="/assets/promo.DZS64TtT.png" alt="promo" />
        </div>
        <div className={styles.card}>
          <BanknoteArrowUp size={32} color="#7272D1" />
          <span className={styles.cardTitle}>{renderWithLineBreaks(t("card.title4"))}</span>
          <span className={styles.cardDesc}>
            {renderWithLineBreaks(t("card.desc4"))}
          </span>
          <img src="/assets/paid-messages.BaWCZflB.png" alt="paid-messages" />
        </div>
        <div className={styles.card}>
          <Coins size={32} color="#7272D1" />
          <span className={styles.cardTitle}>{renderWithLineBreaks(t("card.title5"))}</span>
          <span className={styles.cardDesc}>
            {renderWithLineBreaks(t("card.desc5"))}
          </span>
          <img src="/assets/donates.CF_hg6G4.png" alt="donates" />
        </div>
        <div className={styles.card}>
          <Send size={32} color="#7272D1" />
          <span className={styles.cardTitle}>{renderWithLineBreaks(t("card.title6"))}</span>
          <span className={styles.cardDesc}>
            {renderWithLineBreaks(t("card.desc6"))}
          </span>
          <img src="/assets/mass-messages.Bcl3ROP0.png" alt="mass-messages" />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
