import { memo, useCallback, useState } from "react";
import { TierCard } from "@features/subscriptionTiers/ui/tierCard/TierCard";
import { CreateTierModal } from "@features/subscriptionTiers/ui/CreateTierModal";
import { TierList } from "@features/subscriptionTiers/ui/tierList/TierList";
import MyButton from "@shared/ui/button/MyButton";
import { useTranslation } from "react-i18next";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";
import {
  useGetTiersQuery,
  useGetSubscriptionStatusQuery,
} from "@features/subscriptionTiers/model/api/subscriptionApi";
import type { SubscriptionTier } from "@features/subscriptionTiers/model/types/types";
import styles from "./SubscriptionWidget.module.scss";
import { EditTierModal } from "@features/subscriptionTiers";
import { FollowButton } from "@features/subscriptionTiers/ui/followButton/FollowButton";
 
interface SubscriptionTiersWidgetProps {
  username: string;
  isMyProfile: boolean;
}
 
export const SubscriptionTiersWidget = memo(
  ({ username, isMyProfile }: SubscriptionTiersWidgetProps) => {
    const { data, isFetching, isError, refetch } = useGetTiersQuery({
      username,
    });
    const tiers = data?.items ?? [];
 
    const { data: subStatus } = useGetSubscriptionStatusQuery(
      { username },
      { skip: isMyProfile },
    );
 
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(
      null,
    );
    const { t } = useTranslation();
 
    const handleCreated = useCallback(() => {
      refetch();
      setIsCreateOpen(false);
    }, [refetch]);
 
    const handleUpdated = useCallback(() => {
      refetch();
      setEditingTier(null);
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
 
            {editingTier && (
              <EditTierModal
                isOpen={!!editingTier}
                onClose={() => setEditingTier(null)}
                username={username}
                tier={editingTier}
                onUpdated={handleUpdated}
              />
            )}
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
              isCurrentTier={
                !isMyProfile &&
                !!subStatus?.paid &&
                subStatus?.paid?.tierId === tier.id
              }
              onDelete={refetch}
              onEdit={(t) => setEditingTier(t)}
            />
          )}
        />
 
        {tiers.length === 0 && !isFetching && (
          <div>{renderWithLineBreaks(t("subscription.noTiers"))}</div>
        )}
        {!isMyProfile && <FollowButton username={username} />}
      </div>
    );
  },
);