import styles from "./StastSection.module.scss";

const StatsSection = () => {
  return (
    <section id="statistics" className={styles.statsContainer}>
      <div className={styles.stats}>
        <div className={styles.content}>
          <div className={styles.title}>1M+</div>
          <span className={styles.desc}>subscribers on the platform</span>
        </div>
        <div className={styles.content}>
          <div className={styles.title}>50K+</div>
          <span className={styles.desc}>active creators</span>
        </div>
        <div className={styles.content}>
          <div className={styles.title}>20M+</div>
          <span className={styles.desc}>payments per year</span>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
