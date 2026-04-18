import { memo, useEffect } from "react";
import { useLazyGetFeedQuery } from "@entities/post/model/api/postApi";
import { PostLikeButton } from "@features/postLike/ui/PostLikeButton";
import { PostCardShell } from "@entities/post/ui/postCard/PostCard";
import { PostComments } from "@features/postComments";
import { PostList } from "@entities/post/ui/postList/PostList";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@shared/lib/I18n/getDateLocale";
import { renderWithLineBreaks } from "@shared/lib/utils/renderWithLineBreaks";
import MyButton from "@shared/ui/button/MyButton";
import Loader from "@shared/ui/loader/Loader";
import Avatar from "@shared/ui/avatar/Avatar";
import { Link } from "react-router-dom";
import styles from "./FeedPage.module.scss";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";
const PAGE_SIZE = 10;

export const FeedPage = memo(() => {
  const [trigger, { data, isFetching, isError }] = useLazyGetFeedQuery();
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);

  useEffect(() => {
    trigger({ take: PAGE_SIZE, cursor: null });
  }, [trigger]);

  const loadMore = () => {
    const nextCursor = data?.nextCursor;
    if (!nextCursor) return;
    trigger({ take: PAGE_SIZE, cursor: nextCursor });
  };

  const posts = data?.items ?? [];
  const hasMore = !!data?.nextCursor;

  if (isError) return <div>Failed to load feed</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("Feed")}</h2>

      {isFetching && posts.length === 0 && <Loader />}

      {!isFetching && posts.length === 0 && (
        <div className={styles.empty}>
          {renderWithLineBreaks(t("feed.empty"))}
        </div>
      )}

      <PostList
        posts={posts}
        renderItem={(post) => {
          const avatarSrc = post.author.avatarUrl
            ? `${API_ORIGIN}${post.author.avatarUrl}`
            : "/default_avatar.png";

          return (
            <div key={post.id} className={styles.feedItem}>
              <Link
                to={`/profile/${post.author.username}`}
                className={styles.authorLink}
              >
                <Avatar src={avatarSrc} size="36px" />
                <span className={styles.authorName}>
                  {post.author.username}
                </span>
              </Link>

              <PostCardShell
                post={post}
                locale={locale}
                actionsSlot={
                  <PostLikeButton
                    username={post.author.username}
                    postId={post.id}
                    currentLikesCount={post._count.likes}
                    liked={post.liked}
                  />
                }
                commentsSlot={
                  <PostComments
                    username={post.author.username}
                    postId={post.id}
                    locale={locale}
                    locked={post.locked}
                  />
                }
              />
            </div>
          );
        }}
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

      {!hasMore && posts.length > 0 && (
        <div style={{ opacity: 0.7, textAlign: "center" }}>
          {renderWithLineBreaks(t("postWidget.postsEnd"))}
        </div>
      )}
    </div>
  );
});
