import type { SubscriptionTier } from "../../model/types/types";
import styles from "./TierCard.module.scss";
import MyButton from "@shared/ui/button/MyButton";
import { Settings, Trash2, Users } from "lucide-react";
import { SubscribeButton } from "../subscribeButton/SubscribeButton";
import { useDeleteTierMutation } from "../../model/api/subscriptionApi";
import { useTranslation } from "react-i18next";

interface TierCardProps {
  tier: SubscriptionTier;
  isOwner: boolean;
  username: string;
  isCurrentTier?: boolean;
  onEdit?: (tier: SubscriptionTier) => void;
  onDelete?: () => void;
}

export const TierCard = (props: TierCardProps) => {
  const { tier, isOwner, username, isCurrentTier, onEdit, onDelete } = props;
  const [deleteTier, { isLoading: isDeleting }] = useDeleteTierMutation();
  const { t } = useTranslation();

  const price =
    tier.priceCents != null && tier.priceCents > 0
      ? `${tier.priceCents / 100}`
      : t("Free");

  const handleDelete = async () => {
    if (!confirm(t("tier.deleteConfirm"))) return;

    try {
      await deleteTier({ username, tierId: tier.id }).unwrap();
      onDelete?.();
    } catch (e) {
      console.error(e);
      alert(t("tier.deleteFailed"));
    }
  };

  return (
    <div
      className={`${styles.cardContainer} ${isCurrentTier ? styles.currentTier : ""}`}
    >
      {isCurrentTier && (
        <span className={styles.currentBadge}>{t("tier.yourTier")}</span>
      )}

      {isOwner && (
        <div className={styles.cardHeader}>
          <strong className={styles.title}>{tier.title}</strong>
          <div className={styles.btn}>
            <MyButton
              size="AUTO"
              icon={<Settings size={18} />}
              color="TRANSPARENT"
              onClick={() => onEdit?.(tier)}
            />
            <MyButton
              size="AUTO"
              icon={<Trash2 size={18} />}
              color="TRANSPARENT"
              onClick={handleDelete}
              disabled={isDeleting}
            />
          </div>
        </div>
      )}

      <div className={styles.info}>
        {!isOwner && <strong className={styles.title}>{tier.title}</strong>}

        <span className={styles.price}>
          {price} ₽ {t("per month")}
        </span>

        {tier.description && <p className={styles.desc}>{tier.description}</p>}

        {tier.subscriberCount !== undefined && (
          <span className={styles.subscribers}>
            <Users size={14} />
            {tier.subscriberCount} {t("tier.subscribers")}
          </span>
        )}

        {!isOwner && (
          <div style={{ marginTop: 8 }}>
            <SubscribeButton
              username={username}
              tier={tier}
              isCurrentTier={isCurrentTier}
            />
          </div>
        )}
      </div>
    </div>
  );
};
