import { Link } from "react-router-dom";
import type { Subscriptions } from "../../model/types/subscriptionsTypes";
import { useTranslation } from "react-i18next";
import MyButton from "@shared/ui/button/MyButton";
import Avatar from "@shared/ui/avatar/Avatar";
import Loader from "@shared/ui/loader/Loader";
import styles from "./SubscriptionCard.module.scss";
import {
  useUnsubscribeMutation,
  useSubscribeMutation,
} from "@features/subscriptionTiers/model/api/subscriptionApi";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

interface SubscriptionCardProps {
  item: Subscriptions;
  onChanged?: () => void;
}

export const SubscriptionCard = (props: SubscriptionCardProps) => {
  const { item, onChanged } = props;
  const [unsubscribe, { isLoading: isUnsubLoading }] =
    useUnsubscribeMutation();
  const [subscribe, { isLoading: isSubLoading }] = useSubscribeMutation();
  const { t } = useTranslation();

  const isLoading = isUnsubLoading || isSubLoading;

  const avatar = item.avatarUrl
    ? `${API_ORIGIN}${item.avatarUrl}`
    : "/default_avatar.png";

  const isActive = item.status === "active";
  const isCancelled = item.status === "cancelled";
  const isExpired = item.status === "expired";

  const priceDisplay =
    item.tierPriceCents != null && item.tierPriceCents > 0
      ? `${item.tierPriceCents / 100} ₽`
      : t("Free");

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe({ username: item.username }).unwrap();
      onChanged?.();
    } catch (e) {
      console.error("Unsubscribe failed", e);
    }
  };

  const handleRenew = async () => {
    try {
      await subscribe({
        username: item.username,
        tierId: item.tierId,
      }).unwrap();
      onChanged?.();
    } catch (e) {
      console.error("Renew failed", e);
    }
  };

  const getStatusLabel = () => {
    if (isActive) return t("sub.statusActive");
    if (isCancelled) return t("sub.statusCancelled");
    if (isExpired) return t("sub.statusExpired");
    return item.status;
  };

  const getStatusClass = () => {
    if (isActive) return styles.statusActive;
    if (isCancelled) return styles.statusCancelled;
    return styles.statusExpired;
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <Avatar src={avatar} alt={item.username} size="80px" />
        <span className={`${styles.statusBadge} ${getStatusClass()}`}>
          {getStatusLabel()}
        </span>
      </div>

      <div className={styles.info}>
        <Link to={`/profile/${item.username}`} className={styles.name}>
          {item.username}
        </Link>

        {item.tierTitle && (
          <div className={styles.tierTitle}>
            {item.tierTitle} — {priceDisplay} / {t("per month")}
          </div>
        )}

        {item.expiresAt && (
          <div className={styles.expiry}>
            {isCancelled
              ? t("sub.accessUntil")
              : t("sub.renewDate")}
            {": "}
            {new Date(item.expiresAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {isActive && (
          <MyButton color="RED" onClick={handleUnsubscribe} disabled={isLoading}>
            {isLoading ? <Loader /> : t("sub.unsubscribe")}
          </MyButton>
        )}

        {isCancelled && (
          <MyButton onClick={handleRenew} disabled={isLoading}>
            {isLoading ? <Loader /> : t("sub.resubscribe")}
          </MyButton>
        )}

        {isExpired && (
          <MyButton onClick={handleRenew} disabled={isLoading}>
            {isLoading ? <Loader /> : t("sub.renew")}
          </MyButton>
        )}
      </div>
    </div>
  );
};
