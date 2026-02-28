import { useUpdateBannerMutation } from "@entities/user/model/api/userApi";
import styles from "./ProfileBanner.module.scss";
import { useRef } from "react";
import type { User } from "@entities/user";
import ProfileBanner from "@shared/ui/profileBanner/ProfileBanner";
import MyButton from "@shared/ui/button/MyButton";
import { Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProfileBannerComponentProps {
  user: User;
  isMyProfile: boolean;
}

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

export const ProfileBannerComponent = ({
  user,
  isMyProfile,
}: ProfileBannerComponentProps) => {
  const [updateBanner, { isLoading }] = useUpdateBannerMutation();
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const {t} = useTranslation()

  const bannerSrc = user.bannerUrl
    ? `${API_ORIGIN}${user.bannerUrl}`
    : "/default_banner.png";

  const pickBanner = () => bannerInputRef.current?.click();

  const onBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await updateBanner({ username: user.username, file }).unwrap();
    e.target.value = "";
  };

  return (
    <div className={styles.container}>
      <ProfileBanner src={bannerSrc} />

      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onBannerChange}
      />

      {isMyProfile && (
        <div className={styles.controls}>
          <MyButton
            onClick={pickBanner}
            disabled={isLoading}
            icon={<Camera size={24} />}
            color="GRAY"
          >
            {isLoading ? "Updating..." : t("Banner")}
          </MyButton>
        </div>
      )}
    </div>
  );
};
