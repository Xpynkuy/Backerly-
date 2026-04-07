import { baseApi } from "@shared/api/baseApi";
import type { Comment, PostPage } from "../types/postTypes";

type ProfilePostsArgs = {
  username: string;
  take?: number;
  cursor?: string | null;
  tag?: string | null;
};

type FeedArgs = {
  take?: number;
  cursor?: string | null;
  tag?: string | null;
};

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfilePosts: builder.query<PostPage, ProfilePostsArgs>({
      query: ({ username, take = 5, cursor, tag }) => ({
        url: `/users/${username}/posts`,
        method: "GET",
        params: {
          take,
          cursor: cursor ?? undefined,
          tag: tag ?? undefined,
        },
      }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.username}-${queryArgs.tag ?? "all"}`;
      },

      merge: (currentCache, newData, meta) => {
        const cursor = meta.arg?.cursor ?? null;
        if (!cursor) {
          currentCache.items = newData.items;
          currentCache.nextCursor = newData.nextCursor;
          return;
        }
        const existingIds = new Set(currentCache.items.map((p) => p.id));
        for (const p of newData.items) {
          if (!existingIds.has(p.id)) currentCache.items.push(p);
        }
        currentCache.nextCursor = newData.nextCursor;
      },

      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          currentArg?.username !== previousArg?.username ||
          currentArg?.cursor !== previousArg?.cursor ||
          currentArg?.take !== previousArg?.take ||
          currentArg?.tag !== previousArg?.tag
        );
      },

      providesTags: (_result, _error, arg) => [
        { type: "Posts" as const, id: arg.username },
      ],
    }),

    toggleLike: builder.mutation<
      { liked: boolean; likesCount: number },
      { postId: string; username: string }
    >({
      query: ({ postId }) => ({
        url: `/posts/${postId}/like`,
        method: "POST",
      }),

      async onQueryStarted(
        { postId, username },
        { dispatch, queryFulfilled },
      ) {
        const patchProfile = dispatch(
          postApi.util.updateQueryData(
            "getProfilePosts",
            { username },
            (draft) => {
              const post = draft.items.find((p) => p.id === postId);
              if (!post) return;
              post.liked = !post.liked;
              post._count.likes += post.liked ? 1 : -1;
            },
          ),
        );

        const patchFeed = dispatch(
          postApi.util.updateQueryData("getFeed", {}, (draft) => {
            const post = draft.items.find((p) => p.id === postId);
            if (!post) return;
            post.liked = !post.liked;
            post._count.likes += post.liked ? 1 : -1;
          }),
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            postApi.util.updateQueryData(
              "getProfilePosts",
              { username },
              (draft) => {
                const post = draft.items.find((p) => p.id === postId);
                if (!post) return;
                post.liked = data.liked;
                post._count.likes = data.likesCount;
              },
            ),
          );

          dispatch(
            postApi.util.updateQueryData("getFeed", {}, (draft) => {
              const post = draft.items.find((p) => p.id === postId);
              if (!post) return;
              post.liked = data.liked;
              post._count.likes = data.likesCount;
            }),
          );
        } catch {
          patchProfile.undo();
          patchFeed.undo();
        }
      },
    }),

    deletePost: builder.mutation<void, { postId: string; username: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}`,
        method: "DELETE",
      }),

      async onQueryStarted(
        { postId, username },
        { dispatch, queryFulfilled },
      ) {
        const patch = dispatch(
          postApi.util.updateQueryData(
            "getProfilePosts",
            { username },
            (draft) => {
              draft.items = draft.items.filter((p) => p.id !== postId);
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    getComments: builder.query<{ items: Comment[] }, { postId: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}/comments`,
        method: "GET",
      }),
    }),

    addComment: builder.mutation<
      { comment: Comment; commentsCount: number },
      { postId: string; text: string; username: string }
    >({
      query: ({ postId, text }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { text },
      }),

      async onQueryStarted(
        { postId, username },
        { dispatch, queryFulfilled },
      ) {
        const patchPosts = dispatch(
          postApi.util.updateQueryData(
            "getProfilePosts",
            { username },
            (draft) => {
              const post = draft.items.find((p) => p.id === postId);
              if (post) post._count.comments += 1;
            },
          ),
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            postApi.util.updateQueryData(
              "getComments",
              { postId },
              (draft) => {
                draft.items.unshift(data.comment);
              },
            ),
          );
        } catch {
          patchPosts.undo();
        }
      },
      invalidatesTags: (_r, _e, { postId }) => [
        { type: "Comments", id: postId },
      ],
    }),

    createPost: builder.mutation<any, { username: string; form: FormData }>({
      query: ({ username, form }) => ({
        url: `/users/${username}/posts`,
        method: "POST",
        body: form,
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "Posts" as const, id: username },
        "NotificationCount" as any,
        "Notifications" as any,
      ],
    }),

    updatePost: builder.mutation<
      any,
      { postId: string; username: string; form: FormData }
    >({
      query: ({ postId, form }) => ({
        url: `/posts/${postId}`,
        method: "PUT",
        body: form,
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "Posts" as const, id: username },
      ],
    }),

    getFeed: builder.query<PostPage, FeedArgs>({
      query: ({ take = 10, cursor, tag }) => ({
        url: `feed`,
        method: "GET",
        params: {
          take,
          cursor: cursor ?? undefined,
          tag: tag ?? undefined,
        },
      }),

      serializeQueryArgs: ({ endpointName }) => endpointName,

      merge: (currentCache, newData, meta) => {
        const cursor = meta.arg?.cursor ?? null;
        if (!cursor) {
          currentCache.items = newData.items;
          currentCache.nextCursor = newData.nextCursor;
          return;
        }
        const existingIds = new Set(currentCache.items.map((p) => p.id));
        for (const p of newData.items) {
          if (!existingIds.has(p.id)) currentCache.items.push(p);
        }
        currentCache.nextCursor = newData.nextCursor;
      },

      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          currentArg?.cursor !== previousArg?.cursor ||
          currentArg?.tag !== previousArg?.tag
        );
      },
    }),

    getDashboardStats: builder.query<any, void>({
      query: () => ({
        url: "/stats/dashboard",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazyGetProfilePostsQuery,
  useGetProfilePostsQuery,
  useToggleLikeMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useLazyGetFeedQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useCreatePostMutation,
  useGetDashboardStatsQuery,
} = postApi;