import { memo, useEffect, useState } from "react";
import { useLazyGetProfilePostsQuery } from "@entities/post/model/api/postApi";
import { PostLikeButton } from "@features/postLike/ui/PostLikeButton";
import { PostCardShell } from "@entities/post/ui/postCard/PostCard";
import { PostComments } from "@features/postComments";
import { PostList } from "@entities/post/ui/postList/PostList";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@shared/lib/I18n/getDateLocale";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";
import { CreatePostModal } from "@features/createPost";
import MyButton from "@shared/ui/button/MyButton";
import Loader from "@shared/ui/loader/Loader";
import { PostDeleteButton } from "@features/postDelete";
import styles from "./PostWidget.module.scss";

interface PostWidgetProps {
  username: string;
  isMyProfile: boolean;
}

export const PostsWidget = memo((props: PostWidgetProps) => {
  const { username, isMyProfile } = props;
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const PAGE_SIZE = 5;
  const [trigger, { data, isFetching, isError }] =
    useLazyGetProfilePostsQuery();

  useEffect(() => {
    if (!username) return;
    trigger({ username, take: PAGE_SIZE, cursor: null });
  }, [username, trigger]);

  const loadMore = () => {
    const nextCursor = data?.nextCursor;
    if (!nextCursor) return;
    trigger({ username, take: PAGE_SIZE, cursor: nextCursor });
  };

  const reloadFirstPage = () => {
    trigger({ username, take: PAGE_SIZE, cursor: null });
  };

  if (isError) return <div>Failed to load posts</div>;
  const posts = data?.items ?? [];
  const hasMore = !!data?.nextCursor;
  const locale = getDateLocale(i18n.language);

  return (
    <div className={styles.container}>
      {isMyProfile && (
        <>
          <MyButton
            onClick={() => setCreateModalOpen(true)}
            disabled={isFetching}
            size="FULL"
          >
            {renderWithLineBreaks(t("postWidget.createPost"))}
          </MyButton>

          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            username={username}
            onCreated={() => {
              reloadFirstPage();
              setCreateModalOpen(false);
            }}
          />
        </>
      )}

      <h3>{renderWithLineBreaks(t("postWidget.recentPost"))}</h3>

      <PostList
        posts={posts}
        renderItem={(post) => (
          <PostCardShell
            key={post.id}
            post={post}
            locale={locale}
            actionsSlot={
              <>
                <PostLikeButton
                  username={username}
                  postId={post.id}
                  currentLikesCount={post._count.likes}
                  liked={post.liked}
                />
                {isMyProfile && (
                  <PostDeleteButton username={username} postId={post.id} />
                )}
              </>
            }
            commentsSlot={
              <PostComments
                username={username}
                postId={post.id}
                locale={locale}
              />
            }
          />
        )}
      />

      {hasMore && (
        <MyButton onClick={loadMore} disabled={isFetching} size="FULL">
          {isFetching ? (
            <Loader />
          ) : (
            renderWithLineBreaks(t("postWidget.btnMore"))
          )}
        </MyButton>
      )}

      {!isFetching && posts.length === 0 && (
        <div>{renderWithLineBreaks(t("postWidget.noPosts"))}</div>
      )}

      {!hasMore && posts.length > 0 && (
        <div style={{ opacity: 0.7 }}>
          {renderWithLineBreaks(t("postWidget.postsEnd"))}
        </div>
      )}
    </div>
  );
});
