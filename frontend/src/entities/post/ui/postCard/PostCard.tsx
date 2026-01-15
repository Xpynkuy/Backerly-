import type { ReactNode } from "react";
import type { Post } from "../../model/types/postTypes";
import styles from "./PostCard.module.scss";
import { formatDataTime } from "@shared/lib/format/formatData";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

export const PostCardShell = ({
  post,
  actionsSlot,
  commentsSlot,
  locale,
}: {
  post: Post;
  actionsSlot?: ReactNode;
  commentsSlot?: ReactNode;
  locale: string;
}) => {
  return (
    <div className={styles.container}>
      <span className={styles.date}>
        {formatDataTime(post.createdAt, locale)}
      </span>
      <h3 className={styles.title}>{post.title}</h3>

      {post.imageUrl && (
        <img
          src={`${API_ORIGIN}${post.imageUrl}`}
          alt=""
          className={styles.image}
        />
      )}
      <p className={styles.desc}>{post.description}</p>

      {actionsSlot && <div>{actionsSlot}</div>}

      {commentsSlot && <div>{commentsSlot}</div>}
    </div>
  );
};
