import ProfileBanner from "@shared/ui/profileBanner/ProfileBanner";
import type { User } from "../model/types/userTypes";
import styles from "./UserProfileCard.module.scss";
import Avatar from "@shared/ui/avatar/Avatar";
import MyButton from "@shared/ui/button/MyButton";
import {
  useUpdateAvatarMutation,
  useUpdateBannerMutation,
} from "../model/api/userApi";
import { useRef } from "react";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

export const UserProfileCard = ({
  user,
  isMyProfile,
}: {
  user: User;
  isMyProfile: boolean;
}) => {
  const [updateAvatar, { isLoading: avatarLoading }] =
    useUpdateAvatarMutation();
  const [updateBanner, { isLoading: bannerLoading }] =
    useUpdateBannerMutation();

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const avatarSrc = user.avatarUrl
    ? `${API_ORIGIN}${user.avatarUrl}`
    : "/avatar.jpg";
  const bannerSrc = user.bannerUrl
    ? `${API_ORIGIN}${user.bannerUrl}`
    : "/bgImage.jpg";

  const pickAvatar = () => avatarInputRef.current?.click();
  const pickBanner = () => bannerInputRef.current?.click();

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await updateAvatar({ username: user.username, file }).unwrap();

    e.target.value = "";
  };

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
        style={{ display: "none" }}
        onChange={onBannerChange}
      />
      <div className={styles.content}>
        <div className={styles.profileInfo}>
          <Avatar src={avatarSrc} size="160px" border="1px solid white" />

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onAvatarChange}
          />
          <h3 className={styles.username}>{user.username}</h3>
          {isMyProfile ? (
            <div style={{ display: "flex", gap: 8 }}>
              <MyButton onClick={pickAvatar} disabled={avatarLoading}>
                {avatarLoading ? "Updating..." : "Change avatar"}
              </MyButton>

              <MyButton onClick={pickBanner} disabled={bannerLoading}>
                {bannerLoading ? "Updating..." : "Change banner"}
              </MyButton>
            </div>
          ) : (
            <MyButton>Follow</MyButton>
          )}
          <MyButton>Follow</MyButton>
          <div className={styles.desc}>Best podcast in galaxy</div>
          <div className={styles.stats}>
            <div className={styles.subsInfo}>
              <p>4179</p>
              <span>subscribers</span>
            </div>
            <div className={styles.postsInfo}>
              <p>284</p>
              <span>posts</span>
            </div>
          </div>
        </div>
        <div className={styles.profileFeed}>2</div>
        <div className={styles.profileSubscription}>3</div>
      </div>
    </div>
  );
};
