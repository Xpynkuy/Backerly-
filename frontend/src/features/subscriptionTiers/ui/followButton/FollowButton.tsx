import MyButton from "@shared/ui/button/MyButton";
import {
  useGetSubscriptionStatusQuery,
  useFollowMutation,
  useUnfollowMutation,
} from "../../model/api/subscriptionApi";
import { useTranslation } from "react-i18next";
import { UserPlus, UserCheck } from "lucide-react";
 
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
  const isFollowed = !!status?.follow?.active;
 
  const handleClick = async () => {
    try {
      if (isFollowed) {
        await unfollow({ username }).unwrap();
      } else {
        await follow({ username }).unwrap();
      }
    } catch (e) {
      console.error("Follow action failed", e);
    }
  };
 
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
}
