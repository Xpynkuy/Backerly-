import { useToggleLikeMutation } from "@entities/post/model/api/postApi";
import MyButton from "@shared/ui/button/MyButton";
import { Heart } from "lucide-react";
import styles from "./PostLikeButton.module.scss";

interface PostLikeButtonProps {
  username: string;
  postId: string;
  currentLikesCount: number;
  liked?: boolean;
}

export const PostLikeButton = (props: PostLikeButtonProps) => {
  const { username, postId, currentLikesCount, liked } = props;
  const [toggleLike, { isLoading }] = useToggleLikeMutation();

  const onClick = () => toggleLike({ postId, username });

  return (
    <MyButton
      onClick={onClick}
      disabled={isLoading}
      color="TRANSPARENT"
      size="AUTO"
    >
      <div className={styles.btnContainer}>
        <Heart className={liked ? styles.likedHeart : styles.heart} />
        <span className={liked ? styles.likedCount : ""}>
          {currentLikesCount}
        </span>
      </div>
    </MyButton>
  );
};
