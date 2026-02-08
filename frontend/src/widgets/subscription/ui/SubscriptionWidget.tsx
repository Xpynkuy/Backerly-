import { memo, useCallback, useState } from "react";
import { TierCard } from "@features/subscriptionTiers/ui/tierCard/TierCard";
import { CreateTierModal } from "@features/subscriptionTiers/ui/CreateTierModal";
import { TierList } from "@features/subscriptionTiers/ui/tierList/TierList";
import MyButton from "@shared/ui/button/MyButton";
import { useTranslation } from "react-i18next";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";
import { useGetTiersQuery } from "@features/subscriptionTiers/model/api/subscriptionApi";
import styles from "./SubscriptionWidget.module.scss";

interface SubscriptionTiersWidgetProps {
  username: string;
  isMyProfile: boolean;
}

export const SubscriptionTiersWidget = memo(({
  username,
  isMyProfile,
}: SubscriptionTiersWidgetProps) => {
  const { data, isFetching, isError, refetch } = useGetTiersQuery({ username });
  const tiers = data?.items ?? [];
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { t } = useTranslation();

  const handleCreated = useCallback(() => {
    refetch();
    setIsCreateOpen(false);
  }, [refetch]);

  if (isError) return <div>Failed to load tiers</div>;

  return (
    <div className={styles.container}>
      {isMyProfile && (
        <>
          <MyButton size="FULL" onClick={() => setIsCreateOpen(true)}>
            {renderWithLineBreaks(t("subscription.createTier"))}
          </MyButton>

          <CreateTierModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            username={username}
            onCreated={handleCreated}
          />
        </>
      )}

      <h3>{renderWithLineBreaks(t("subscription.level"))}</h3>

      {isFetching && tiers.length === 0 && <div>Loading...</div>}

      <TierList
        tiers={tiers}
        renderItem={(tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            isOwner={isMyProfile}
            username={username}
            onDelete={refetch}
            onEdit={refetch}
          />
        )}
      />

      {tiers.length === 0 && !isFetching && (
        <div>{renderWithLineBreaks(t("subscription.noTiers"))}</div>
      )}
    </div>
  );
});
