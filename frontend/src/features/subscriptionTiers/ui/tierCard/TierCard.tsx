import { useState } from "react";
import type { SubscriptionTier } from "../../model/types/types";
import styles from "./TierCard.module.scss";
import MyButton from "@shared/ui/button/MyButton";
import Modal from "@shared/ui/modal/Modal";
import { Settings, Trash2, Users, AlertTriangle } from "lucide-react";
import { SubscribeButton } from "../subscribeButton/SubscribeButton";
import {
  useDeleteTierMutation,
  useGetSubscriptionStatusQuery,
} from "../../model/api/subscriptionApi";
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
  const { t, i18n } = useTranslation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: subStatus } = useGetSubscriptionStatusQuery(
    { username },
    { skip: isOwner || !isCurrentTier },
  );

  const paid = subStatus?.paid ?? null;
  const isCancelledCurrent =
    !!isCurrentTier && paid?.status === "cancelled" && !!paid?.expiresAt;

  const formattedExpiry = paid?.expiresAt
    ? new Date(paid.expiresAt).toLocaleDateString(
        i18n.language?.startsWith("ru") ? "ru-RU" : "en-US",
        { day: "numeric", month: "long", year: "numeric" },
      )
    : null;

  const price =
    tier.priceCents != null && tier.priceCents > 0
      ? `${tier.priceCents / 100}`
      : t("Free");

  const durationLabel =
    paid?.durationMonths === 3
      ? t("sub.duration.threeMonths")
      : t("sub.duration.oneMonth");

  const openConfirm = () => {
    setErrorMessage(null);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTier({ username, tierId: tier.id }).unwrap();
      setConfirmOpen(false);
      onDelete?.();
    } catch (err: any) {
      console.error("delete tier failed:", err);
      setConfirmOpen(false);

      const code = err?.data?.error;
      const status = err?.status;

      if (code === "TIER_HAS_ACTIVE_SUBSCRIBERS" || status === 400) {
        setBlockedOpen(true);
      } else {
        setErrorMessage(t("tier.deleteFailed"));
      }
    }
  };

  return (
    <div
      className={`${styles.cardContainer} ${isCurrentTier ? styles.currentTier : ""}`}
    >
      {isCurrentTier && !isCancelledCurrent && (
        <div className={styles.currentBlock}>
          <span className={styles.currentBadge}>{t("tier.yourTier")}</span>
          {paid && (
            <span className={styles.currentMeta}>
              {durationLabel}
              {formattedExpiry && (
                <>
                  {" · "}
                  {t("sub.renewDate")}: {formattedExpiry}
                </>
              )}
            </span>
          )}
        </div>
      )}

      {isCancelledCurrent && (
        <div className={styles.cancelledNotice}>
          <strong>{t("tier.cancelledTitle")}</strong>
          <span>
            {t("tier.cancelledAccessUntil")} {formattedExpiry}
          </span>
          {paid && (
            <span className={styles.cancelledMeta}>
              {t("sub.durationLabel")}: {durationLabel}
            </span>
          )}
        </div>
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
              onClick={openConfirm}
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

        {isOwner && errorMessage && (
          <div className={styles.inlineError}>{errorMessage}</div>
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

      {/* Confirm delete */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className={styles.deleteModal}>
          <h3 className={styles.deleteTitle}>{t("tier.deleteTitle")}</h3>
          <p className={styles.deleteDesc}>
            {t("tier.deleteConfirmText", { title: tier.title })}
          </p>
          <div className={styles.deleteActions}>
            <MyButton
              color="RED"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "..." : t("Delete")}
            </MyButton>
            <MyButton color="GRAY" onClick={() => setConfirmOpen(false)}>
              {t("Cancel")}
            </MyButton>
          </div>
        </div>
      </Modal>

      {/* Blocked: has active subscribers */}
      <Modal isOpen={blockedOpen} onClose={() => setBlockedOpen(false)}>
        <div className={styles.blockedModal}>
          <div className={styles.blockedIcon}>
            <AlertTriangle size={32} />
          </div>
          <h3 className={styles.blockedTitle}>
            {t("tier.deleteBlockedTitle")}
          </h3>
          <p className={styles.blockedDesc}>
            {t("tier.deleteBlockedDesc", { title: tier.title })}
          </p>
          <div className={styles.blockedActions}>
            <MyButton size="FULL" onClick={() => setBlockedOpen(false)}>{t("OK")}</MyButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};