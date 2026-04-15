import { Link } from "react-router-dom";
import type { Subscriptions } from "../../model/types/subscriptionsTypes";
import { useTranslation } from "react-i18next";
import MyButton from "@shared/ui/button/MyButton";
import Avatar from "@shared/ui/avatar/Avatar";
import Loader from "@shared/ui/loader/Loader";
import { AlertCircle, UserCheck, CreditCard } from "lucide-react";
import styles from "./SubscriptionCard.module.scss";
import {
  useUnsubscribeMutation,
  useSubscribeMutation,
  useUnfollowMutation,
} from "@features/subscriptionTiers/model/api/subscriptionApi";
 
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";
 
interface SubscriptionCardProps {
  item: Subscriptions;
  onChanged?: () => void;
}
 
export const SubscriptionCard = (props: SubscriptionCardProps) => {
  const { item, onChanged } = props;
  const [unsubscribe, { isLoading: isUnsubLoading }] = useUnsubscribeMutation();
  const [subscribe, { isLoading: isSubLoading }] = useSubscribeMutation();
  const [unfollow, { isLoading: isUnfollowLoading }] = useUnfollowMutation();
  const { t, i18n } = useTranslation();
 
  const isLoading = isUnsubLoading || isSubLoading || isUnfollowLoading;
 
  const avatar = item.avatarUrl
    ? `${API_ORIGIN}${item.avatarUrl}`
    : "/default_avatar.png";
 
  const paid = item.paid;
  const isFollowActive = item.follow.active;
 
  const isPaidActive = paid?.status === "active";
  const isPaidCancelled = paid?.status === "cancelled";
 
  const dateLocale = i18n.language?.startsWith("ru") ? "ru-RU" : "en-US";
  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(dateLocale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;
 
  const priceDisplay =
    paid?.tierPriceCents != null && paid.tierPriceCents > 0
      ? `${paid.tierPriceCents / 100} ₽`
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
    if (!paid?.tierId) return;
    try {
      await subscribe({
        username: item.username,
        tierId: paid.tierId,
      }).unwrap();
      onChanged?.();
    } catch (e) {
      console.error("Renew failed", e);
    }
  };
 
  const handleUnfollow = async () => {
    try {
      await unfollow({ username: item.username }).unwrap();
      onChanged?.();
    } catch (e) {
      console.error("Unfollow failed", e);
    }
  };
 
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <Avatar src={avatar} alt={item.username} size="80px" />
        <div className={styles.badges}>
          {isFollowActive && (
            <span className={`${styles.statusBadge} ${styles.statusFollowing}`}>
              <UserCheck size={12} /> {t("sub.statusFollowing")}
            </span>
          )}
          {isPaidActive && (
            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
              <CreditCard size={12} /> {t("sub.statusActive")}
            </span>
          )}
          {isPaidCancelled && (
            <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>
              {t("sub.statusCancelled")}
            </span>
          )}
        </div>
      </div>
 
      <div className={styles.info}>
        <Link to={`/profile/${item.username}`} className={styles.name}>
          {item.username}
        </Link>
 
        {/* Follow section */}
        {isFollowActive && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <UserCheck size={14} />
              <span>{t("sub.freeFollow")}</span>
            </div>
            <div className={styles.sectionActions}>
              <MyButton
                size="AUTO"
                color="GRAY"
                onClick={handleUnfollow}
                disabled={isLoading}
              >
                {isUnfollowLoading ? <Loader /> : t("follow.unfollow")}
              </MyButton>
            </div>
          </div>
        )}
 
        {/* Paid section */}
        {paid && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <CreditCard size={14} />
              <span>
                {paid.tierTitle} — {priceDisplay} / {t("per month")}
              </span>
            </div>
 
            {isPaidActive && paid.expiresAt && (
              <div className={styles.expiry}>
                {t("sub.renewDate")}: {formatDate(paid.expiresAt)}
              </div>
            )}
 
            {isPaidCancelled && paid.expiresAt && (
              <div className={styles.cancelledNotice}>
                <AlertCircle size={18} />
                <div className={styles.cancelledText}>
                  <strong>{t("sub.cancelledBanner")}</strong>
                  <span>
                    {t("sub.accessUntil")} {formatDate(paid.expiresAt)}
                  </span>
                </div>
              </div>
            )}
 
            <div className={styles.sectionActions}>
              {isPaidActive && (
                <MyButton
                  color="RED"
                  size="AUTO"
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                >
                  {isUnsubLoading ? <Loader /> : t("sub.unsubscribe")}
                </MyButton>
              )}
              {isPaidCancelled && (
                <MyButton
                  size="AUTO"
                  onClick={handleRenew}
                  disabled={isLoading}
                >
                  {isSubLoading ? <Loader /> : t("sub.resubscribe")}
                </MyButton>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};