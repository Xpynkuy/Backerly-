import styles from "./Loader.module.scss";

const Loader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.loader}>
        <span className={styles.loader__text}>loading</span>
        <span className={styles.load}></span>
      </div>
    </div>
  );
};

export default Loader;
