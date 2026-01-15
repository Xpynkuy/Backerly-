import { useToggleLikeMutation, postApi } from "@entities/post/model/api/postApi";
import { useAppDispatch } from "@shared/lib/hooks/hooks";
import MyButton from "@shared/ui/button/MyButton";
import { Heart } from "lucide-react";


interface PostLikeButtonProps {
  username: string;
  postId: string;
  currentLikesCount: number;
  liked?: boolean;
}

export const PostLikeButton = (props: PostLikeButtonProps) => {
  const {username, postId, currentLikesCount, liked} = props
  const dispatch = useAppDispatch();

  const [toggleLike, { isLoading }] = useToggleLikeMutation();

  const onClick = async () => {
    const res = await toggleLike({ postId }).unwrap();

    dispatch(
      postApi.util.updateQueryData(
        "getProfilePosts",
        { username, take: 5, cursor: null },
        (draft) => {
          const p = draft.items.find((x) => x.id === postId);
          if (!p) return;

          p._count.likes = res.likesCount;
        }
      )
    );
  };

  return (
    <MyButton icon={<Heart className={liked ? "likedHeart" : ""}/>} onClick={onClick} disabled={isLoading} color="TRANSPARENT" size="AUTO">
       {currentLikesCount}
    </MyButton>
  );
};
