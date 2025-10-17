import styles from "./HowItWork.module.scss";

const HowItWorkSection = () => {
  return (
    <section id="how-it-works" className={styles.SectionContainer}>
      <div className={styles.title}>
        <span>How it works?</span>
        <h2>Everything’s super easy</h2>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <img
            src="/assets/1-pic.D0Dxt1l7.png"
            alt="Step 1"
          />
          <span className={styles.step}>Step 1</span>
          <h3 className={styles.cardTitle}>
            Sign up <br /> and create your blog
          </h3>
          <span className={styles.cardDesc}>
            Creating and setting up your page <br /> takes no more than five
            minutes.
          </span>
        </div>
        <div className={styles.card}>
          <img
            src="/assets/2-pic.CYkcJeEA.png"
            alt="Step 2"
          />
          <span className={styles.step}>Step 2</span>
          <h3 className={styles.cardTitle}>
            Create content and share it <br /> with your audience
          </h3>
          <span className={styles.cardDesc}>
            Post articles, photos, start <br /> live streams, and upload videos.
          </span>
        </div>
        <div className={styles.card}>
          <img
            src="/assets/3-pic.DcCb6ZdZ.png"
            alt="Step 3"
          />
          <span className={styles.step}>Step 3</span>
          <h3 className={styles.cardTitle}>
            Earn steady <br /> income
          </h3>
          <span className={styles.cardDesc}>
            Payments are processed automatically. <br /> Recurring subscriptions
            and donations provide.
          </span>
        </div>
      </div>
    </section>
  );
};

export default HowItWorkSection;
