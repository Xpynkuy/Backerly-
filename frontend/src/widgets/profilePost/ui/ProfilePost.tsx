import { useEffect } from "react";
import { useLazyGetProfilePostsQuery } from "@entities/post/model/api/postApi";

import { CreatePost } from "@features/createPost/ui/CreatePost";
import { PostLikeButton } from "@features/postLike/ui/PostLikeButton";
import { PostComments } from "@features/postComments/ui/PostComments";

import { PostCardShell } from "@entities/post/ui/postCard/PostCard";
import { PostList } from "@entities/post/ui/postList/PostList";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@shared/lib/I18n/getDateLocale";
import MyButton from "@shared/ui/button/MyButton";

/**
 * Widget: ProfilePostsWidget
 *
 * Это слой, который имеет право:
 * - импортировать entities (PostList, PostCardShell)
 * - импортировать features (like/comments/create)
 * - связывать их в один экранный блок
 *
 * Также здесь живёт логика "пагинации UI":
 * - первая загрузка
 * - load more
 */
export const ProfilePostsWidget = ({
  username,
  isMyProfile,
}: {
  username: string;
  isMyProfile: boolean;
}) => {
  const PAGE_SIZE = 5;

  // useLazy... даёт функцию запуска запроса + состояние результата
  const [fetchPosts, { data, isFetching, isError }] =
    useLazyGetProfilePostsQuery();

  // 1) при смене username загружаем первую страницу (cursor=null)
  useEffect(() => {
    if (!username) return;
    fetchPosts({ username, take: PAGE_SIZE, cursor: null });
  }, [username, fetchPosts]);

  // 2) load more использует nextCursor из data
  const loadMore = () => {
    const nextCursor = data?.nextCursor;
    if (!nextCursor) return;

    fetchPosts({ username, take: PAGE_SIZE, cursor: nextCursor });
    // ВАЖНО: благодаря merge() в postApi,
    // новые posts допишутся в data.items автоматически.
  };

  // 3) после создания поста обновляем первую страницу (перезапись кэша)
  const reloadFirstPage = () => {
    fetchPosts({ username, take: PAGE_SIZE, cursor: null });
  };

  if (isError) return <div>Failed to load posts</div>;

  // data может быть undefined пока запрос не вернул ответ
  const posts = data?.items ?? [];

  // если nextCursor есть — значит ещё можно догрузить
  const hasMore = !!data?.nextCursor;

  const { i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Создание поста только владельцу профиля */}
      {isMyProfile && (
        <CreatePost username={username} onCreated={reloadFirstPage} />
      )}

      {/* Рендер списка через renderItem */}
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
                />
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

      {/* Load more */}
      {hasMore && (
        <MyButton
          onClick={loadMore}
          disabled={isFetching}
          size="FULL"
          
        >
          {isFetching ? "Loading..." : "Load more"}
        </MyButton>
      )}

      {/* UX состояния */}
      {!isFetching && posts.length === 0 && <div>No posts yet</div>}
      {!hasMore && posts.length > 0 && (
        <div style={{ opacity: 0.7 }}>No more posts</div>
      )}
    </div>
  );
};
