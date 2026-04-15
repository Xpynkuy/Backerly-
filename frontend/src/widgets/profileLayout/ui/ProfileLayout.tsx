import { useAppSelector } from "@shared/lib/hooks/hooks";
import { useParams } from "react-router-dom";
import { SubscriptionTiersWidget } from "../../subscription/index";
import { PostsWidget } from "../../post/index";
import { UserWidget } from "../../user/index";
import { useGetUserByUsernameQuery } from "@entities/user";
import styles from "./ProfileLayout.module.scss";
import { memo } from "react";
 
export const ProfileLayout = memo(() => {
  const { username } = useParams<{ username: string }>();
  const authUser = useAppSelector((s) => s.auth.user);
 
  const isMyProfile =
    !!authUser && !!username && authUser.username === username;
 
  const { data: user } = useGetUserByUsernameQuery(username ?? "", {
    skip: !username,
  });
 
  if (!username) {
    return <div>Username is missing in URL</div>;
  }
 
  const isCreator = !!user?.isCreator;
 
  return (
    <div className={styles.container}>
      <UserWidget />
      {isCreator && (
        <div className={styles.main}>
          <PostsWidget username={username} isMyProfile={isMyProfile} />
          <SubscriptionTiersWidget
            username={username}
            isMyProfile={isMyProfile}
          />
        </div>
      )}
    </div>
  );
});
 