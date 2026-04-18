import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetMeQuery } from "@features/auth/model/api/authApi";
import {
  useGetPayoutInfoQuery,
  useRequestWithdrawalMutation,
} from "@features/payouts/model/api/payoutsApi";
import Loader from "@shared/ui/loader/Loader";
import MyButton from "@shared/ui/button/MyButton";
import Modal from "@shared/ui/modal/Modal";
import { Wallet, TrendingUp } from "lucide-react";
import styles from "./PayoutsPage.module.scss";

export const PayoutsPage = () => {
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data, isLoading, isError, refetch } = useGetPayoutInfoQuery(
    undefined,
    { skip: !me?.isCreator },
  );
  const [requestWithdrawal, { isLoading: isWithdrawing }] =
    useRequestWithdrawalMutation();
  const { t, i18n } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const autoRefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (autoRefetchTimerRef.current) {
        clearTimeout(autoRefetchTimerRef.current);
      }
    };
  }, []);

  if (isMeLoading) return <Loader />;
  if (me && !me.isCreator) return <Navigate to="/" replace />;
  if (isLoading) return <Loader />;
  if (isError || !data) return <div>Failed to load payout info</div>;

  const fmt = (cents: number) => `${(cents / 100).toFixed(2)} ₽`;
  const dateLocale = i18n.language?.startsWith("ru") ? "ru-RU" : "en-US";
  const formatMonth = (s: string) => {
    const [y, m] = s.split("-").map(Number);
    if (!y || !m) return s;
    const d = new Date(y, m - 1, 1);
    const name = d.toLocaleString(dateLocale, { month: "short" });
    return `${name.charAt(0).toUpperCase()}${name.slice(1).replace(".", "")} ${y}`;
  };

  const canWithdraw = data.availableBalanceCents >= data.minWithdrawalCents;

  const openModal = () => {
    setAmountInput((data.availableBalanceCents / 100).toFixed(2));
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    const amountCents = Math.round(parseFloat(amountInput) * 100);
    if (!amountCents || isNaN(amountCents)) {
      setToast(t("payouts.toast.invalid"));
      setTimeout(() => setToast(null), 4000);
      return;
    }
    try {
      await requestWithdrawal({ amountCents }).unwrap();
      setModalOpen(false);
      setToast(t("payouts.toast.success"));
      setTimeout(() => setToast(null), 4000);

      // Backend auto-completes the withdrawal after 10s.
      // Refetch just after that to reflect the new status.
      if (autoRefetchTimerRef.current) {
        clearTimeout(autoRefetchTimerRef.current);
      }
      autoRefetchTimerRef.current = setTimeout(() => {
        refetch();
      }, 10_500);
    } catch (e: any) {
      setModalOpen(false);
      setToast(e?.data?.error || t("payouts.toast.failed"));
      setTimeout(() => setToast(null), 4000);
    }
  };

  const maxIncome = Math.max(...data.incomePerMonth.map((i) => i.cents), 1);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Wallet size={24} /> {t("payouts.title")}
      </h2>

      <div className={styles.summaryCard}>
        <div className={styles.row}>
          <span>{t("payouts.lifetime")}</span>
          <strong>{fmt(data.lifetimeGrossCents)}</strong>
        </div>
        <div className={styles.row}>
          <span>
            {t("payouts.commission")} ({(data.commissionRate * 100).toFixed(0)}
            %)
          </span>
          <strong className={styles.minus}>
            −{fmt(data.lifetimeGrossCents - data.lifetimeNetCents)}
          </strong>
        </div>
        <div className={styles.row}>
          <span>{t("payouts.totalWithdrawn")}</span>
          <strong className={styles.minus}>
            −{fmt(data.totalWithdrawnCents)}
          </strong>
        </div>
        <hr className={styles.hr} />
        <div className={styles.rowTotal}>
          <span>{t("payouts.available")}</span>
          <strong className={styles.total}>
            {fmt(data.availableBalanceCents)}
          </strong>
        </div>
        <div className={styles.row}>
          <span>{t("payouts.currentMonth")}</span>
          <strong>{fmt(data.currentMonthGrossCents)}</strong>
        </div>
        <MyButton
          onClick={openModal}
          disabled={!canWithdraw || isWithdrawing}
          size="FULL"
          color="GREEN"
        >
          {t("payouts.withdrawBtn")}
        </MyButton>
        {!canWithdraw && (
          <span className={styles.minNote}>
            {t("payouts.minNote", { min: fmt(data.minWithdrawalCents) })}
          </span>
        )}
      </div>
      <div className={styles.stats}>
        <div className={styles.charts}>
          <div className={styles.chartBlock}>
            <h3>
              <TrendingUp size={18} /> {t("payouts.incomeChart")}
            </h3>
            <div className={styles.chart}>
              {data.incomePerMonth.map((item) => (
                <div key={item.month} className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{
                      height: `${Math.max((item.cents / maxIncome) * 120, 4)}px`,
                    }}
                  />
                  <span className={styles.barLabel}>
                    {formatMonth(item.month)}
                  </span>
                  <span className={styles.barValue}>{fmt(item.cents)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {data.history.length > 0 && (
        <div className={styles.history}>
          <h3>{t("payouts.history")}</h3>
          {data.history.map((w) => (
            <div key={w.id} className={styles.historyItem}>
              <span className={styles.histDate}>
                {new Date(w.createdAt).toLocaleDateString(dateLocale)}
              </span>
              <span className={styles.histAmount}>{fmt(w.amountCents)}</span>
              <span className={`${styles.histStatus} ${styles[w.status]}`}>
                {t(`payouts.status.${w.status}`, w.status)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className={styles.modalContent}>
          <h3>{t("payouts.modalTitle")}</h3>
          <div className={styles.modalRow}>
            <span>{t("payouts.available")}</span>
            <strong>{fmt(data.availableBalanceCents)}</strong>
          </div>
          <label className={styles.amountLabel}>
            {t("payouts.amountLabel")}
          </label>
          <input
            type="number"
            step="0.01"
            min={data.minWithdrawalCents / 100}
            max={data.availableBalanceCents / 100}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className={styles.amountInput}
          />
          <p className={styles.modalDesc}>
            {t("payouts.minNote", { min: fmt(data.minWithdrawalCents) })}
          </p>
          <div className={styles.modalActions}>
            <MyButton
              onClick={handleConfirm}
              disabled={isWithdrawing}
              color="GREEN"
            >
              {isWithdrawing ? "..." : t("payouts.confirmBtn")}
            </MyButton>
            <MyButton color="GRAY" onClick={() => setModalOpen(false)}>
              {t("Cancel")}
            </MyButton>
          </div>
        </div>
      </Modal>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
};
