import styles from "./profileBanner.module.scss";

interface profileBannerProps {
  src?: string;
  alt?: string;
}
const ProfileBanner = (props: profileBannerProps) => {
  const { src, alt } = props;
  return <img src={src} alt={alt} className={styles.banner} />;
};

export default ProfileBanner;
