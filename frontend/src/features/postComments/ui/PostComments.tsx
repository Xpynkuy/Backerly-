import { useState } from "react";
import {
  useAddCommentMutation,
  useGetCommentsQuery,
  postApi,
} from "@entities/post/model/api/postApi";
import { useAppDispatch } from "@shared/lib/hooks/hooks";
import MyButton from "@shared/ui/button/MyButton";
import { MessageCircleMore } from "lucide-react";
import styles from "./PostComment.module.scss";
import MyInput from "@shared/ui/input/MyInput";
import Loader from "@shared/ui/loader/Loader";
import Avatar from "@shared/ui/avatar/Avatar";
import { formatDataTime } from "@shared/lib/format/formatData";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";

export const PostComments = ({
  username,
  postId,
  locale,
}: {
  username: string;
  postId: string;
  locale: string;
}) => {
  const dispatch = useAppDispatch();

  // open — локальное UI состояние (не нужно в redux)
  const [open, setOpen] = useState(false);

  // text — локальный ввод
  const [text, setText] = useState("");

  // запрос комментов, выполняется только если open=true
  const { data, isFetching, isError, refetch } = useGetCommentsQuery(
    { postId },
    { skip: !open }
  );

  // mutation добавления
  const [addComment, { isLoading }] = useAddCommentMutation();

  const toggle = () => setOpen((p) => !p);

  const submit = async () => {
    if (!text.trim()) return;

    // 1) отправили коммент
    const res = await addComment({ postId, text }).unwrap();

    // 2) очистили ввод
    setText("");

    // 3) обновили счётчик комментов у поста в ленте
    dispatch(
      postApi.util.updateQueryData(
        "getProfilePosts",
        { username, take: 5, cursor: null },
        (draft) => {
          const p = draft.items.find((x) => x.id === postId);
          if (!p) return;

          p._count.comments = res.commentsCount;
        }
      )
    );
    await refetch();
  };

  return (
    <div>
      <MyButton
        icon={<MessageCircleMore color="#7272D1" />}
        onClick={toggle}
        size="AUTO"
        color="TRANSPARENT"
      >
        {open ? (
          <span className={styles.btnText}>Hide</span>
        ) : (
          <span className={styles.btnText}>Show comments</span>
        )}
      </MyButton>

      {open && (
        <div className={styles.commentContainer}>
          <div className={styles.commentInput}>
            <MyInput
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
            />
            <MyButton onClick={submit} disabled={isLoading} color="PRIMARY">
              {isLoading ? "..." : "Send"}
            </MyButton>
          </div>

          <div style={{ marginTop: 10 }}>
            {isFetching && (
              <div>
                <Loader />
              </div>
            )}
            {isError && <div>Failed to load comments</div>}

            {(data?.items ?? []).map((c) => {
              const avatarSrc = c.author.avatarUrl
                ? `${API_ORIGIN}${c.author.avatarUrl}`
                : "/default_avatar.png";

              return (
                <div key={c.id} className={styles.author}>
                  <Avatar src={avatarSrc} size="38px" />
                  <div className={styles.authorCommentBlock}>
                    <span className={styles.authorName}>
                      {c.author.username}
                    </span>
                    <p className={styles.authorText}>{c.text}</p>
                    <span className={styles.commentDate}>
                      {formatDataTime(c.createdAt, locale)}
                    </span>
                  </div>
                </div>
              );
            })}

            {!isFetching && (data?.items?.length ?? 0) === 0 && (
              <div className={styles.notif}>No comments yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
