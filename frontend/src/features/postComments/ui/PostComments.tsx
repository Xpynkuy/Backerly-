import { useState } from "react";
import {
  useAddCommentMutation,
  useGetCommentsQuery,
} from "@entities/post/model/api/postApi";
import MyButton from "@shared/ui/button/MyButton";
import { MessageCircleMore, Lock } from "lucide-react";
import styles from "./PostComment.module.scss";
import { CommentForm } from "@features/commentForm/ui/CommentForm";
import { CommentList } from "@entities/comment/ui/commentList/CommentList";
import { useTranslation } from "react-i18next";

interface PostCommentsProps {
  username: string;
  postId: string;
  locale: string;
  locked?: boolean;
}

export const PostComments = ({
  username,
  postId,
  locale,
  locked,
}: PostCommentsProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { data, isFetching, isError } = useGetCommentsQuery(
    { postId },
    { skip: !open || !!locked },
  );

  const [addComment, { isLoading }] = useAddCommentMutation();
  const { t } = useTranslation();

  const toggle = () => setOpen((p) => !p);

  const submit = async () => {
    if (!text.trim()) return;

    try {
      await addComment({
        postId,
        text,
        username,
      }).unwrap();

      setText("");
    } catch (e) {
      console.error("addComment failed", e);
    }
  };

  return (
    <div>
      <MyButton
        icon={<MessageCircleMore color="#7272D1" />}
        onClick={toggle}
        size="AUTO"
        color="TRANSPARENT"
      >
        <span className={styles.btnText}>
          {open ? t("Hide") : t("Show comments")}
        </span>
      </MyButton>

      {open && (
        <div className={styles.commentContainer}>
          {locked ? (
            <div className={styles.lockedNotice}>
              <Lock size={18} />
              <span>{t("post.locked.commentsDisabled")}</span>
            </div>
          ) : (
            <>
              <CommentForm
                value={text}
                onChange={setText}
                onSubmit={submit}
                isLoading={isLoading}
              />

              <CommentList
                comments={data?.items}
                isFetching={isFetching}
                isError={isError}
                locale={locale}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};