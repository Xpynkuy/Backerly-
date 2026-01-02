import ProfileBanner from "@shared/ui/profileBanner/ProfileBanner";
import type { User } from "../model/types/userTypes";
import styles from './UserProfileCard.module.scss'
import Avatar from "@shared/ui/avatar/Avatar";
import MyButton from "@shared/ui/button/MyButton";

export const UserProfileCard = ({user}: {user:User}) => {
  return (
     <div className={styles.container}>
      <ProfileBanner src="/public/bgImage.jpg" />
      <div className={styles.content}>
        <div className={styles.profileInfo}>
          <Avatar
            src="/public/avatar.jpg"
            size="160px"
            border="1px solid white"
          />
          <h3 className={styles.username}>{user.username}</h3>
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
