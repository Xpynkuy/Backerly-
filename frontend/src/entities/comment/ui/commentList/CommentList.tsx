import Loader from "@shared/ui/loader/Loader";
import styles from "./CommentList.module.scss";
import { CommentCard } from "../commentCard/CommentCard";
import { useTranslation } from "react-i18next";

interface CommentListProps {
  comments?: any[];
  isFetching: boolean;
  isError: boolean;
  locale: string;
}

export const CommentList = ({
  comments = [],
  isFetching,
  isError,
  locale,
}: CommentListProps) => {
  const { t } = useTranslation();
  if (isFetching) {
    return <Loader />;
  }

  if (isError) {
    return <div>Failed to load comments</div>;
  }

  if (comments.length === 0) {
    return <div className={styles.notif}>{t("No comments yet")}</div>;
  }

  return (
    <div className={styles.list}>
      {comments.map((c) => (
        <CommentCard key={c.id} comment={c} locale={locale} />
      ))}
    </div>
  );
};
