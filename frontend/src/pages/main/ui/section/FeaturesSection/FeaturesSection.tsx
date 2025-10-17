import {
  Banknote,
  BanknoteArrowUp,
  Coins,
  Percent,
  Send,
  Star,
} from "lucide-react";
import styles from "./FeaturesSection.module.scss";

const FeaturesSection = () => {
  return (
    <section id="features" className={styles.featuresContainer}>
      <div className={styles.title}>
        <span>What we offer</span>
        <h1>Everything you need to start earning</h1>
      </div>

      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <Banknote size={32} color="#7272D1" />
          <span className={styles.cardTitle}>Daily payouts</span>
          <span className={styles.cardDesc}>
            Receive payouts every day — your income <br /> always arrives on
            time
          </span>
          <img src="/assets/withdraw.BaeUhuf6.png" alt="withdraw" />
        </div>
        <div className={styles.card}>
          <Star size={32} color="#7272D1" />
          <span className={styles.cardTitle}>Subscription levels</span>
          <span className={styles.cardDesc}>
            Set up subscription levels and monetize your <br /> content for
            maximum profit
          </span>
          <img src="/assets/subscriptions.6u62L5l-.png" alt="subscriptions" />
        </div>
        <div className={styles.card}>
          <Percent size={32} color="#7272D1" />
          <span className={styles.cardTitle}>Promotions</span>
          <span className={styles.cardDesc}>
            Offer trial periods and su bscription discounts
          </span>
          <img src="/assets/promo.DZS64TtT.png" alt="promo" />
        </div>
        <div className={styles.card}>
          <BanknoteArrowUp size={32} color="#7272D1" />
          <span className={styles.cardTitle}>Paid messages</span>
          <span className={styles.cardDesc}>
            Make money by charging for message access
          </span>
          <img src="/assets/paid-messages.BaWCZflB.png" alt="paid-messages" />
        </div>
        <div className={styles.card}>
          <Coins size={32} color="#7272D1" />
          <span className={styles.cardTitle}>Donations</span>
          <span className={styles.cardDesc}>
            Get support from your fans directly via <br /> donations
          </span>
          <img src="/assets/donates.CF_hg6G4.png" alt="donates" />
        </div>
        <div className={styles.card}>
          <Send size={32} color="#7272D1" />
          <span className={styles.cardTitle}>Mass messaging</span>
          <span className={styles.cardDesc}>
            Easily and effectively deliver your message to <br /> the entire
            audience
          </span>
          <img src="/assets/mass-messages.Bcl3ROP0.png" alt="mass-messages" />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
