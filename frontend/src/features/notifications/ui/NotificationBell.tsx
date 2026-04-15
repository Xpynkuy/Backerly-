import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useGetUnreadCountQuery,
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
} from "../model/api/notificationApi";
import { useTranslation } from "react-i18next";
import styles from "./NotificationBell.module.scss";
 
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
 
  const { data: countData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 5000,
  });
  const { data: notifData } = useGetNotificationsQuery(
    { take: 10 },
    { skip: !isOpen },
  );
  const [markRead] = useMarkNotificationsReadMutation();
 
  const unreadCount = countData?.count ?? 0;
  const items = notifData?.items ?? [];
 
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
 
  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0) {
      markRead({});
    }
  };
 
  const formatMessage = (item: {
    type: string;
    authorName: string;
    message: string;
  }) => {
    if (item.type === "new_post") {
      // Backend stores: `${username} published a new post: "${title}"`
      const match = item.message.match(/:\s*"([^"]*)"/);
      const postTitle = match ? match[1] : "";
      return t("notif.newPost", {
        author: item.authorName,
        title: postTitle,
      });
    }
    return item.message;
  };
 
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return t("notif.justNow");
    if (diffMin < 60) return `${diffMin} ${t("notif.minAgo")}`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} ${t("notif.hAgo")}`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} ${t("notif.dAgo")}`;
  };
 
  return (
    <div className={styles.container} ref={ref}>
      <button className={styles.bellButton} onClick={handleOpen}>
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
 
      {isOpen && (
        <div className={styles.dropdown}>
          <h4 className={styles.dropdownTitle}>{t("notif.title")}</h4>
          {items.length === 0 ? (
            <div className={styles.empty}>{t("notif.empty")}</div>
          ) : (
            <div className={styles.list}>
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/profile/${item.authorName}`}
                  className={`${styles.item} ${!item.isRead ? styles.unread : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className={styles.itemText}>{formatMessage(item)}</span>
                  <span className={styles.itemTime}>
                    {formatTime(item.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};