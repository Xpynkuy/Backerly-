import Avatar from "@shared/ui/avatar/Avatar";
import styles from "./CommentCard.module.scss";
import { formatDataTime } from "@shared/lib/format/formatData";
import type { Comment } from "@entities/comment/model/types/commentTypes";
import { AppLink } from "@shared/ui/AppLink/AppLink";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

interface CommentCardProps {
  comment: Comment;
  locale: string;
}

export const CommentCard = ({ comment, locale }: CommentCardProps) => {
  const avatarSrc = comment.author.avatarUrl
    ? `${API_ORIGIN}${comment.author.avatarUrl}`
    : "/default_avatar.png";

  return (
    <div className={styles.author}>
      <Avatar src={avatarSrc} size="38px" />

      <div className={styles.authorCommentBlock}>
        <AppLink
          to={`/profile/${comment.author.username}`}
          className={styles.authorName}
        >
          {comment.author.username}
        </AppLink>

        <p className={styles.authorText}>{comment.text}</p>

        <span className={styles.commentDate}>
          {formatDataTime(comment.createdAt, locale)}
        </span>
      </div>
    </div>
  );
};
