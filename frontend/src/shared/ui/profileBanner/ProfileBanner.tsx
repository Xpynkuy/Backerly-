import styles from "./ProfileBanner.module.scss";

interface ProfileBannerProps {
  src?: string;
}

const ProfileBanner = ({ src }: ProfileBannerProps) => {
  return (
    <div
      className={styles.banner}
      style={{
        backgroundImage: `url(${src})`,
      }}
    />
  );
};

export default ProfileBanner;
