import type { SubscriptionTier } from "../../model/types/types";
import styles from "./TierCard.module.scss";
import MyButton from "@shared/ui/button/MyButton";
import { Settings, Trash2 } from "lucide-react";
import { SubscribeButton } from "../subscribeButton/SubscribeButton";
import {
  useDeleteTierMutation,
  useUpdateTierMutation,
} from "../../model/api/subscriptionApi";

interface TierCardProps {
  tier: SubscriptionTier;
  isOwner: boolean;
  username: string;
  onEdit?: () => void;
  onDelete?: () => void;
}
export const TierCard = (props: TierCardProps) => {
  const { tier, isOwner, username, onEdit, onDelete } = props;
  const [deleteTier, { isLoading: isDeleting }] = useDeleteTierMutation();
  const [updateTier, { isLoading: isUpdating }] = useUpdateTierMutation();

  const price = tier.priceCents != null ? `${tier.priceCents / 100}` : "Free";

  const handleDelete = async () => {
    if (!confirm("Delete tier? Posts that used this tier will be unlocked."))
      return;

    try {
      await deleteTier({ username, tierId: tier.id }).unwrap();
      onDelete?.();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const handleEdit = async () => {
    const newTitle = prompt("New title", tier.title);
    if (newTitle == null) return;

    const newDesc = prompt("New description", tier.description ?? "") ?? "";

    try {
      const form = new FormData();
      form.append("title", newTitle);
      form.append("description", newDesc);

      await updateTier({ username, tierId: tier.id, form }).unwrap();
      onEdit?.();
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  return (
    <div className={styles.cardContainer}>
      {isOwner && (
        <div className={styles.cardHeader}>
          <strong className={styles.title}>{tier.title}</strong>
          <div className={styles.btn}>
            <MyButton
              size="AUTO"
              icon={<Settings size={18} />}
              color="TRANSPARENT"
              onClick={handleEdit}
              disabled={isUpdating}
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

        <span className={styles.price}>{price} ₽ per month</span>
        {tier.description && <p className={styles.desc}>{tier.description}</p>}
        {!isOwner && (
          <div style={{ marginTop: 8 }}>
            <SubscribeButton username={username} tierId={tier.id} />
          </div>
        )}
      </div>
    </div>
  );
};
