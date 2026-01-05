import { useGetUserByUsernameQuery, UserProfileCard } from "@entities/user";
import { useAppSelector } from "@shared/lib/hooks/hooks";
import Loader from "@shared/ui/loader/Loader";
import { useParams } from "react-router-dom";

export const ProfileWidget = () => {
  const { username } = useParams<{ username: string }>();
  const authUser = useAppSelector((s) => s.auth.user);

  const isMyProfile =
    !!authUser && !!username && authUser.username === username;
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useGetUserByUsernameQuery(username ?? "", {
    skip: !username,
  });

  if (!username) {
    return <div>Username is missing in URL</div>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return <div>No user data</div>;
  }

  if (isError) {
    const status = (error as any)?.status;
    if (status === 404) return <div>User not found</div>;
    return <div>Failed to load profile</div>;
  }
  return (
    <div>
      <UserProfileCard user={user} isMyProfile={isMyProfile} />
    </div>
  );
};
