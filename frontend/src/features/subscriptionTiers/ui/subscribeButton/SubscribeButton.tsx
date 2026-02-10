import MyButton from "@shared/ui/button/MyButton";
import {
  useGetSubscriptionStatusQuery,
  useSubscribeMutation,
  useUnsubscribeMutation,
} from "../../model/api/subscriptionApi";

export const SubscribeButton = ({
  username,
  tierId,
}: {
  username: string;
  tierId?: string | null;
}) => {
  const { data, isFetching } = useGetSubscriptionStatusQuery({ username });

  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] =
    useUnsubscribeMutation();

  const loading = isFetching || isSubscribing || isUnsubscribing;

  const subscribed = !!data?.subscribed;
  const currentTierId = data?.tierId ?? null;

  const isSubscribedToThisTier = tierId
    ? subscribed && currentTierId === tierId
    : subscribed;

  const onClick = async () => {
    try {
      if (isSubscribedToThisTier) {
        await unsubscribe({ username, tierId }).unwrap();
      } else {
        await subscribe({ username, tierId }).unwrap();
      }
    } catch (e) {
      console.error("Subscribe/unsubscribe failed", e);
      alert("Subscription action failed");
    }
  };

  // 5. UI
  return (
    <MyButton onClick={onClick} disabled={loading} size="FULL">
      {loading ? "..." : isSubscribedToThisTier ? "Unsubscribe" : "Subscribe"}
    </MyButton>
  );
};
