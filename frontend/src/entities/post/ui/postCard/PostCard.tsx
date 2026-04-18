import type { ReactNode } from "react";
import type { Post } from "../../model/types/postTypes";
import styles from "./PostCard.module.scss";
import { formatDataTime } from "@shared/lib/format/formatData";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";

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
  const { t } = useTranslation();

  return (
    <div
      className={`${styles.container} ${post.locked ? styles.containerLocked : ""}`}
    >
      {post.isPaid && post.accessTier && (
        <span className={styles.paidBadge}>
          <Lock size={14} /> {post.accessTier.title}
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
        {post.imageUrl ? (
          <img
            src={`${API_ORIGIN}${post.imageUrl}`}
            alt=""
            className={`${styles.image} ${post.locked ? styles.imageLocked : ""}`}
          />
        ) : (
          post.locked && <div className={styles.imagePlaceholder} />
        )}

        {post.locked && (
          <div className={styles.lockOverlay}>
            <div className={styles.lockIconBox}>
              <Lock size={32} strokeWidth={2.2} />
            </div>
            <strong className={styles.lockTitle}>{t("post.locked.title")}</strong>
            <span className={styles.lockDesc}>{renderWithLineBreaks(t("post.locked.desc"))}</span>
            {post.accessTier && (
              <span className={styles.lockTier}>
                {t("post.locked.requiredTier")}:{" "}
                <strong>{post.accessTier.title}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      <div className={styles.postHeader}>
        <h3 className={styles.title}>{post.title}</h3>
        <span className={styles.date}>
          {formatDataTime(post.createdAt, locale)}
        </span>
      </div>

      {post.locked ? (
        <div className={styles.descLocked}>{t("post.locked.desc")}</div>
      ) : (
        <div className={styles.desc}>{post.description ?? ""}</div>
      )}

      <div className={styles.slot}>
        {actionsSlot && <div className={styles.actions}>{actionsSlot}</div>}
        {commentsSlot && <div>{commentsSlot}</div>}
      </div>
    </div>
  );
};