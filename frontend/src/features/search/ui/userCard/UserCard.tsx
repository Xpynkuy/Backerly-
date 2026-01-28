import { Link } from "react-router-dom";
import type { UserSearch } from "@features/search/model/types/userSearchTypes";
import Avatar from "@shared/ui/avatar/Avatar";
import styles from "./UserCard.module.scss";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

interface UserCardProps {
  user: UserSearch;
}

export const UserCard = (props: UserCardProps) => {
  const { user } = props;
  const avatar = user.avatarUrl
    ? `${API_ORIGIN}${user.avatarUrl}`
    : "/default_avatar.png";
  return (
    <div className={styles.cardContainer}>
      <Avatar src={avatar} alt={user.username} size="60px" />
      <div className={styles.info}>
        <Link to={`/profile/${user.username}`} className={styles.name}>
          {user.username}
        </Link>
        {user.description ? (
          <p className={styles.desc}>{user.description}</p>
        ) : (
          <p className={styles.notif}>No description</p>
        )}
      </div>
    </div>
  );
};
