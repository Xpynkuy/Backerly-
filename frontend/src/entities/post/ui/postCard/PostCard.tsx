import type { ReactNode } from "react";
import type { Post } from "../../model/types/postTypes";
import styles from "./PostCard.module.scss";
import { formatDataTime } from "@shared/lib/format/formatData";
import { LockKeyhole } from "lucide-react";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

export const PostCardShell = ({
  post,
  actionsSlot,
  commentsSlot,
  locale,
}: {
  post: Post & { locked?: boolean };
  actionsSlot?: ReactNode;
  commentsSlot?: ReactNode;
  locale: string;
  username?: string;
}) => {
  return (
    <div className={styles.container}>
      {post.isPaid && post.accessTier && (
        <span className={styles.paidBadge}>
          <LockKeyhole size={14} /> {post.accessTier.title}
        </span>
      )}
      {post.tags && post.tags.length > 0 && (
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className={styles.mediaWrapper}>
        {post.imageUrl && (
          <img
            src={`${API_ORIGIN}${post.imageUrl}`}
            alt=""
            className={styles.image}
          />
        )}
        {post.locked && <div className={styles.lockOverlay}></div>}
      </div>
      <div className={styles.postHeader}>
        <h3 className={styles.title}>{post.title}</h3>
        <span className={styles.date}>
          {formatDataTime(post.createdAt, locale)}
        </span>
      </div>

      <div className={post.locked ? styles.descBlur : styles.desc}>
        {post.description ??
          (post.locked ? "This content is locked. Subscribe to access." : "")}
      </div>
      <div className={styles.slot}>
        {actionsSlot && <div className={styles.actions}>{actionsSlot}</div>}
        {commentsSlot && <div>{commentsSlot}</div>}
      </div>
    </div>
  );
};