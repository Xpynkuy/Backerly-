import MyButton from "@shared/ui/button/MyButton";
import {
  useGetSubscriptionStatusQuery,
  useFollowMutation,
  useUnfollowMutation,
} from "../../model/api/subscriptionApi";
import { useTranslation } from "react-i18next";
import { UserPlus, UserCheck } from "lucide-react";
import styles from "./FollowButton.module.scss";

interface FollowButtonProps {
  username: string;
}

export const FollowButton = ({ username }: FollowButtonProps) => {
  const { data: status, isFetching } = useGetSubscriptionStatusQuery({
    username,
  });
  const [follow, { isLoading: isFollowing }] = useFollowMutation();
  const [unfollow, { isLoading: isUnfollowing }] = useUnfollowMutation();
  const { t } = useTranslation();

  const loading = isFetching || isFollowing || isUnfollowing;
  const isFollowed = !!status?.followed;
  const hasPaidTier = !!status?.tierId;

  const handleClick = async () => {
    try {
      if (isFollowed && !hasPaidTier) {
        await unfollow({ username }).unwrap();
      } else if (!isFollowed) {
        await follow({ username }).unwrap();
      }
    } catch (e) {
      console.error("Follow action failed", e);
    }
  };

  // Don't show unfollow if user has paid tier (unsubscribe handles that)
  if (isFollowed && hasPaidTier) {
    return (
      <div className={styles.followedBadge}>
        <UserCheck size={16} />
        <span>{t("follow.following")}</span>
      </div>
    );
  }

  return (
    <MyButton
      onClick={handleClick}
      disabled={loading}
      size="FULL"
      color={isFollowed ? "GRAY" : "GREEN"}
      icon={isFollowed ? <UserCheck size={18} /> : <UserPlus size={18} />}
    >
      {loading
        ? "..."
        : isFollowed
          ? t("follow.unfollow")
          : t("follow.follow")}
    </MyButton>
  );
};