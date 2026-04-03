import { useState } from "react";
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

export const SubscribeButton = ({
  username,
  tier,
  isCurrentTier,
}: SubscribeButtonProps) => {
  const { data: status, isFetching } = useGetSubscriptionStatusQuery({
    username,
  });
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] =
    useUnsubscribeMutation();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const loading = isFetching || isSubscribing || isUnsubscribing;

  const subscribed = !!status?.subscribed;
  const currentTierId = status?.tierId ?? null;
  const currentTierPrice = status?.tierPriceCents ?? 0;
  const tierPrice = tier.priceCents ?? 0;

  const isSubscribedToThisTier = subscribed && currentTierId === tier.id;
  const isUpgrade = subscribed && tierPrice > (currentTierPrice ?? 0);
  const isDowngrade =
    subscribed &&
    !isSubscribedToThisTier &&
    tierPrice < (currentTierPrice ?? 0);

  const handleSubscribeClick = () => {
    if (isSubscribedToThisTier) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleConfirmSubscribe = async () => {
    try {
      await subscribe({ username, tierId: tier.id }).unwrap();
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

  const getButtonLabel = () => {
    if (loading) return "...";
    if (isSubscribedToThisTier) return t("sub.unsubscribe");
    if (isUpgrade) return t("sub.upgrade");
    if (isDowngrade) return t("sub.downgrade");
    return t("sub.subscribe");
  };

  const getButtonColor = (): "PRIMARY" | "RED" | "GREEN" | "ACCENT" => {
    if (isSubscribedToThisTier) return "RED";
    if (isUpgrade) return "ACCENT";
    return "PRIMARY";
  };

  return (
    <>
      <MyButton
        onClick={handleSubscribeClick}
        disabled={loading}
        size="FULL"
        color={getButtonColor()}
      >
        {getButtonLabel()}
      </MyButton>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalContent}>
          {isSubscribedToThisTier ? (
            <>
              <h3 className={styles.modalTitle}>{t("sub.unsubscribeTitle")}</h3>
              <p className={styles.modalDesc}>{t("sub.unsubscribeDesc")}</p>
              {status?.expiresAt && (
                <p className={styles.modalExpiry}>
                  {t("sub.accessUntil")}{" "}
                  {new Date(status.expiresAt).toLocaleDateString()}
                </p>
              )}
              <div className={styles.modalActions}>
                <MyButton
                  color="RED"
                  onClick={handleConfirmUnsubscribe}
                  disabled={loading}
                >
                  {loading ? "..." : t("sub.confirmUnsubscribe")}
                </MyButton>
                <MyButton color="GRAY" onClick={() => setIsModalOpen(false)}>
                  {t("Cancel")}
                </MyButton>
              </div>
            </>
          ) : (
            <>
              <h3 className={styles.modalTitle}>
                {isUpgrade
                  ? t("sub.upgradeTitle")
                  : isDowngrade
                    ? t("sub.downgradeTitle")
                    : t("sub.subscribeTitle")}
              </h3>

              <div className={styles.tierInfo}>
                <span className={styles.tierName}>{tier.title}</span>
                <span className={styles.tierPrice}>
                  {priceDisplay} / {t("per month")}
                </span>
                {tier.description && (
                  <p className={styles.tierDesc}>{tier.description}</p>
                )}
              </div>

              <div className={styles.paymentSimulation}>
                <div className={styles.paymentRow}>
                  <span>{t("sub.paymentMethod")}</span>
                  <span className={styles.paymentCard}>
                    •••• •••• •••• 4242
                  </span>
                </div>
                <div className={styles.paymentRow}>
                  <span>{t("sub.total")}</span>
                  <strong>{priceDisplay}</strong>
                </div>
              </div>

              <div className={styles.modalActions}>
                <MyButton onClick={handleConfirmSubscribe} disabled={loading}>
                  {loading ? "..." : t("sub.confirmPayment")}
                </MyButton>
                <MyButton color="GRAY" onClick={() => setIsModalOpen(false)}>
                  {t("Cancel")}
                </MyButton>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
