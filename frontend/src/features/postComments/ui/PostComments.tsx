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
import { CommentForm } from "@features/commentForm/ui/CommentForm";
import { CommentList } from "@entities/comment/ui/commentList/CommentList";

interface PostCommentsProps {
  username: string;
  postId: string;
  locale: string;
}

export const PostComments = ({
  username,
  postId,
  locale,
}: PostCommentsProps) => {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { data, isFetching, isError, refetch } = useGetCommentsQuery(
    { postId },
    { skip: !open }
  );

  const [addComment, { isLoading }] = useAddCommentMutation();

  const toggle = () => setOpen((p) => !p);

  const submit = async () => {
    if (!text.trim()) return;

    const res = await addComment({ postId, text }).unwrap();
    setText("");

    dispatch(
      postApi.util.updateQueryData(
        "getProfilePosts",
        { username, take: 5, cursor: null },
        (draft) => {
          const post = draft.items.find((p) => p.id === postId);
          if (post) {
            post._count.comments = res.commentsCount;
          }
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
        <span className={styles.btnText}>
          {open ? "Hide" : "Show comments"}
        </span>
      </MyButton>

      {open && (
        <div className={styles.commentContainer}>
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
        </div>
      )}
    </div>
  );
};
