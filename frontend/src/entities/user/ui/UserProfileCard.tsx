import { UserDescription } from "@features/userDescription";
import type { User } from "../model/types/userTypes";
import styles from "./UserProfileCard.module.scss";
import { ProfileBannerComponent } from "@entities/profile/ui/profileBanner/ProfileBannerComponent";
import { ProfileInfo } from "@entities/profile/ui/profileInfo/ProfileInfo";

interface UserProfileCardProps {
  user: User;
  isMyProfile: boolean;
}
export const UserProfileCard = (props: UserProfileCardProps) => {
  const { user, isMyProfile } = props;
  return (
    <div className={styles.container}>
      <ProfileBannerComponent user={user} isMyProfile={isMyProfile} />
      <div className={styles.content}>
        <div className={styles.profileInfo}>
          <ProfileInfo
            user={user}
            isMyProfile={isMyProfile}
            descriptionSlot={
              <UserDescription
                username={user.username}
                isMyProfile={isMyProfile}
                description={user.description}
              />
            }
          />
        </div>
      </div>
    </div>
  );
};
