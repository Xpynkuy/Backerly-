import { Zap } from "lucide-react";
import styles from "./BannerSection.module.scss";
import MyButton from "@shared/ui/button/MyButton";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";

const leftImages = [
  "/assets/author-1.AU7h6DGX.webp",
  "/assets/author-2.GfNIkjQd.webp",
  "/assets/author-3.DG3bPsSR.webp",
  "/assets/author-4.CanVhyaY.webp",
  "/assets/author-5.BfVKtPr3.webp",
  "/assets/author-6.5Mk-x5fE.webp",
];

const rightImages = [
  "/assets/author-7.IUZE4ncP.webp",
  "/assets/author-8.BuhsSV2B.webp",
  "/assets/author-9.DcordSDN.webp",
  "/assets/author-10.D0VzBYnN.webp",
  "/assets/author-11.CTqmJYTP.webp",
];

const BannerSection = () => {
  const duplicatedLeft = [...leftImages, ...leftImages];
  const duplicatedRight = [...rightImages, ...rightImages];

  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.leftSide}>
        <div className={styles.info}>
          <Zap size={18} />
          {renderWithLineBreaks(t("banner.creatorsCount"))}
        </div>

        <h1 className={styles.title}>
          {renderWithLineBreaks(t("banner.title"))}
        </h1>

        <span className={styles.desc}>
          {renderWithLineBreaks(t("banner.description"))}
        </span>

        <Link to="/register" className={styles.link}>
          <MyButton size="LARGE">
            {renderWithLineBreaks(t("banner.ctaButton"))}
          </MyButton>
        </Link>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.leftColumn}>
          <div className={styles.imgTrack}>
            {duplicatedLeft.map((src, index) => (
              <div className={styles.imgCard} key={`left-${index}`}>
                <img src={src} alt={`author-${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.imgTrack}>
            {duplicatedRight.map((src, index) => (
              <div className={styles.imgCard} key={`right-${index}`}>
                <img src={src} alt={`author-${index + 7}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
