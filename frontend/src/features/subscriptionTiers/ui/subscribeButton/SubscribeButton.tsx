import { useEffect, useState } from "react";
import MyButton from "@shared/ui/button/MyButton";
import Modal from "@shared/ui/modal/Modal";
import {
  useGetSubscriptionStatusQuery,
  useSubscribeMutation,
  useUnsubscribeMutation,
} from "../../model/api/subscriptionApi";
import type { SubscriptionTier } from "../../model/types/types";
import { useTranslation } from "react-i18next";
import styles from "./SubscribeButton.module.scss";

interface SubscribeButtonProps {
  username: string;
  tier: SubscriptionTier;
  isCurrentTier?: boolean;
}

type DurationOption = 1 | 3;

export const SubscribeButton = ({
  username,
  tier,
  isCurrentTier,
}: SubscribeButtonProps) => {
  const { data: status, isFetching } = useGetSubscriptionStatusQuery({
    username,
  });
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] = useUnsubscribeMutation();
  const { t, i18n } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState<DurationOption>(1);

  useEffect(() => {
    if (isModalOpen) setDuration(1);
  }, [isModalOpen]);

  const loading = isFetching || isSubscribing || isUnsubscribing;

  const paid = status?.paid ?? null;
  const hasActivePaid = !!paid && paid.status === "active" && paid.hasAccess;
  const currentTierId = paid?.tierId ?? null;
  const currentTierPrice = paid?.tierPriceCents ?? 0;
  const tierPrice = tier.priceCents ?? 0;

  const isRenewal = hasActivePaid && currentTierId === tier.id;
  const isSubscribedToThisTier = isRenewal; // for the "cancel" flow
  const isUpgrade =
    hasActivePaid && !isRenewal && tierPrice > (currentTierPrice ?? 0);
  const isDowngrade =
    hasActivePaid && !isRenewal && tierPrice < (currentTierPrice ?? 0);
  const isScheduledDowngrade =
    !!paid?.scheduledTierId && paid.scheduledTierId === tier.id;

  // Duration selector: only when a real fixed-length payment happens
  const showDurationSelector = !hasActivePaid || isRenewal;

  const handleClick = () => setIsModalOpen(true);

  const handleConfirmSubscribe = async () => {
    try {
      await subscribe({
        username,
        tierId: tier.id,
        durationMonths: duration,
      }).unwrap();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Subscribe failed", e);
    }
  };

  const handleConfirmUnsubscribe = async () => {
    try {
      await unsubscribe({ username }).unwrap();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Unsubscribe failed", e);
    }
  };

  const priceDisplay = tierPrice > 0 ? `${tierPrice / 100} ₽` : t("Free");
  const totalCents = showDurationSelector ? tierPrice * duration : 0;
  const totalDisplay =
    totalCents > 0
      ? `${totalCents / 100} ₽`
      : isUpgrade
        ? t("sub.upgradeProrated")
        : isDowngrade
          ? t("sub.downgradeNoCharge")
          : t("Free");

  const dateLocale = i18n.language?.startsWith("ru") ? "ru-RU" : "en-US";
  const formattedExpiry = paid?.expiresAt
    ? new Date(paid.expiresAt).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const getButtonLabel = () => {
    if (loading) return "...";
    if (isRenewal) {
      if (paid?.status === "cancelled") return t("sub.resubscribe");
      return t("sub.renew");
    }
    if (isScheduledDowngrade) return t("sub.scheduledLabel");
    if (isUpgrade) return t("sub.upgrade");
    if (isDowngrade) return t("sub.downgrade");
    return t("sub.subscribe");
  };

  const getButtonColor = (): "PRIMARY" | "RED" | "GREEN" | "ACCENT" | "GRAY" => {
    if (isScheduledDowngrade) return "GRAY";
    if (isUpgrade) return "ACCENT";
    return "PRIMARY";
  };

  const getModalTitle = () => {
    if (isRenewal) return t("sub.renewTitle");
    if (isUpgrade) return t("sub.upgradeTitle");
    if (isDowngrade) return t("sub.downgradeTitle");
    return t("sub.subscribeTitle");
  };

  return (
    <>
      <MyButton
        onClick={handleClick}
        disabled={loading || isScheduledDowngrade}
        size="FULL"
        color={getButtonColor()}
      >
        {getButtonLabel()}
      </MyButton>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>{getModalTitle()}</h3>

          <div className={styles.tierInfo}>
            <span className={styles.tierName}>{tier.title}</span>
            <span className={styles.tierPrice}>
              {priceDisplay} / {t("per month")}
            </span>
            {tier.description && (
              <p className={styles.tierDesc}>{tier.description}</p>
            )}
          </div>

          {isUpgrade && (
            <p className={styles.infoNote}>
              {t("sub.upgradeNote", { date: formattedExpiry ?? "" })}
            </p>
          )}

          {isDowngrade && (
            <p className={styles.infoNote}>
              {t("sub.downgradeNote", { date: formattedExpiry ?? "" })}
            </p>
          )}

          {isRenewal && formattedExpiry && (
            <p className={styles.infoNote}>
              {t("sub.renewNote", { date: formattedExpiry })}
            </p>
          )}

          {showDurationSelector && (
            <div className={styles.durationBlock}>
              <span className={styles.durationLabel}>
                {t("sub.durationLabel")}
              </span>
              <div className={styles.durationOptions}>
                <button
                  type="button"
                  className={`${styles.durationOption} ${
                    duration === 1 ? styles.durationOptionActive : ""
                  }`}
                  onClick={() => setDuration(1)}
                >
                  <strong>{t("sub.duration.oneMonth")}</strong>
                  <span>
                    {tierPrice > 0 ? `${tierPrice / 100} ₽` : t("Free")}
                  </span>
                </button>
                <button
                  type="button"
                  className={`${styles.durationOption} ${
                    duration === 3 ? styles.durationOptionActive : ""
                  }`}
                  onClick={() => setDuration(3)}
                >
                  <strong>{t("sub.duration.threeMonths")}</strong>
                  <span>
                    {tierPrice > 0 ? `${(tierPrice * 3) / 100} ₽` : t("Free")}
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className={styles.paymentSimulation}>
            <div className={styles.paymentRow}>
              <span>{t("sub.paymentMethod")}</span>
              <span className={styles.paymentCard}>•••• •••• •••• 4242</span>
            </div>
            {showDurationSelector && (
              <div className={styles.paymentRow}>
                <span>{t("sub.durationLabel")}</span>
                <span>
                  {duration === 1
                    ? t("sub.duration.oneMonth")
                    : t("sub.duration.threeMonths")}
                </span>
              </div>
            )}
            <div className={styles.paymentRow}>
              <span>{t("sub.total")}</span>
              <strong>{totalDisplay}</strong>
            </div>
          </div>

          <div className={styles.modalActions}>
            <MyButton onClick={handleConfirmSubscribe} disabled={loading}>
              {loading
                ? "..."
                : isDowngrade
                  ? t("sub.confirmSchedule")
                  : t("sub.confirmPayment")}
            </MyButton>
            <MyButton color="GRAY" onClick={() => setIsModalOpen(false)}>
              {t("Cancel")}
            </MyButton>
          </div>
        </div>
      </Modal>
    </>
  );
};