import { Link } from "react-router-dom";
import { useUnsubscribeMutation } from "@entities/post/model/api/postApi";
import type { Subscriptions } from "../../model/types/subscriptionsTypes";
import { useTranslation } from "react-i18next";
import MyButton from "@shared/ui/button/MyButton";
import Avatar from "@shared/ui/avatar/Avatar";
import Loader from "@shared/ui/loader/Loader";
import styles from "./SubscriptionCard.module.scss";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

interface SubscriptionCardProps {
  item: Subscriptions;
  onUnsubscribed?: () => void;
}
export const SubscriptionCard = (props: SubscriptionCardProps) => {
  const { item, onUnsubscribed } = props;
  const [unsubscribe, { isLoading }] = useUnsubscribeMutation();
  const { t } = useTranslation();

  const avatar = item.avatarUrl
    ? `${API_ORIGIN}${item.avatarUrl}`
    : "/default_avatar.png";

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe({ username: item.username }).unwrap();
      onUnsubscribed?.();
    } catch (e) {
      console.error("Unsubscribe failed", e);
      alert("Unsubscribe failed");
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <Avatar src={avatar} alt={item.username} size="80px" />
        <MyButton color="RED" onClick={handleUnsubscribe} disabled={isLoading}>
          {isLoading ? <Loader /> : t("Unsubscribe")}
        </MyButton>
      </div>
      <div className={styles.info}>
        <Link to={`/profile/${item.username}`} className={styles.name}>
          {item.username}
        </Link>

        {item.tierTitle ? (
          <div className={styles.tierTitle}>
            {t("Subscribe level")}: {item.tierTitle}
          </div>
        ) : null}
      </div>
    </div>
  );
};
