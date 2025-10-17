import BannerSection from "./section/BannerSection/BannerSection";
import FeaturesSection from "./section/FeaturesSection/FeaturesSection";
import HowItWorkSection from "./section/HowItWorkSection/HowItWorkSection";
import StatsSection from "./section/StatsSection/StatsSection";
import styles from './MainPage.module.scss'

export const MainPage = () => {
  return (
    <div className={styles.container}>
      <BannerSection />
      <StatsSection />
      <HowItWorkSection />
      <FeaturesSection />
    </div>
  );
};
