import type { ReactNode } from "react";
import styles from "./TierList.module.scss";
import type { SubscriptionTier } from "../../model/types/types";


interface TierListProps {
  tiers: SubscriptionTier[];
  renderItem: (tier: SubscriptionTier) => ReactNode;
}

export const TierList = ({ tiers, renderItem }: TierListProps) => {
  return <div className={styles.listContainer}>{tiers.map(renderItem)}</div>;
};
