import { useGetSubscriptionsQuery } from "@entities/post/model/api/postApi";
import { useAppSelector } from "@shared/lib/hooks/hooks";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SubscriptionCard } from "../subscriptionCard/SubscriptionCard";
import styles from "./SubscriptionsComponent.module.scss";
import { useTranslation } from "react-i18next";

export const SubscriptionsComponent = () => {
  const authUser = useAppSelector((s) => s.auth.user);
  const isAuth = !!authUser;
  const navigate = useNavigate();
  const params = useParams<{ username: string }>();
  const username = params.username ?? authUser?.username;
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  if (!username) return <div>Username missing</div>;

  const { data, isFetching, isError, refetch } = useGetSubscriptionsQuery({
    username,
  });

  const items = data?.items ?? [];

  {
    isFetching && <Loader />;
  }

  {
    isError && <div style={{ color: "red" }}>Failed to load subscriptions</div>;
  }

  return (
    <div className={styles.listContainer}>
      <h2 className={styles.title}>{t("Subscriptions")}</h2>

      {!isFetching && items.length === 0 && (
        <div className={styles.notif}>{t("No subscriptions yet")}</div>
      )}

      <div className={styles.list}>
        {items.map((it) => (
          <SubscriptionCard
            key={it.id}
            item={it}
            onUnsubscribed={() => refetch()}
          />
        ))}
      </div>
    </div>
  );
};
