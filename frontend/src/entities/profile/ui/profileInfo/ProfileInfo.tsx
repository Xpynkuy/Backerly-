import Avatar from "@shared/ui/avatar/Avatar";
import styles from "./ProfileInfo.module.scss";
import MyButton from "@shared/ui/button/MyButton";
import { useUpdateAvatarMutation } from "@entities/user/model/api/userApi";
import { useRef, type ReactNode } from "react";
import type { User } from "@entities/user";
import { Camera } from "lucide-react";

interface ProfileInfoProps {
  user: User;
  isMyProfile: boolean;
  descriptionSlot: ReactNode;
}

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

export const ProfileInfo = ({
  user,
  isMyProfile,
  descriptionSlot,
}: ProfileInfoProps) => {
  const [updateAvatar, { isLoading }] = useUpdateAvatarMutation();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const pickAvatar = () => avatarInputRef.current?.click();

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await updateAvatar({ username: user.username, file }).unwrap();
    e.target.value = "";
  };

  const avatarSrc = user.avatarUrl
    ? `${API_ORIGIN}${user.avatarUrl}`
    : "/default_avatar.png";

  return (
    <div className={styles.container}>
      <div className={styles.avatarWrapper}>
        <Avatar src={avatarSrc} size="160px" border="1px solid #555A60" />

        {isMyProfile && (
          <MyButton
            type="button"
            className={styles.avatarButton}
            onClick={pickAvatar}
            disabled={isLoading}
            icon={<Camera size={18} />}
            size="AUTO"
            color="GRAY"
          />
        )}

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onAvatarChange}
        />
      </div>

      <h3 className={styles.username}>{user.username}</h3>
      <div className={styles.desc}>{descriptionSlot}</div>
    </div>
  );
};
