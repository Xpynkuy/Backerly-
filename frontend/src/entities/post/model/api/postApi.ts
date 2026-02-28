import { baseApi } from "@shared/api/baseApi";
import type { Comment, PostPage } from "../types/postTypes";

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfilePosts: builder.query<
      PostPage,
      { username: string; take?: number; cursor?: string | null }
    >({
      query: ({ username, take = 5, cursor }) => ({
        url: `/users/${username}/posts`,
        method: "GET",
        params: {
          take,
          cursor: cursor ?? undefined,
        },
      }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.username}`;
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
          currentArg?.take !== previousArg?.take
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

      async onQueryStarted({ postId, username }, { dispatch, queryFulfilled }) {
        // 1️⃣ Optimistic update — СРАЗУ
        const patchResult = dispatch(
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
        } catch {
          patchResult.undo();
        }
      },
    }),

    deletePost: builder.mutation<void, { postId: string; username: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}`,
        method: "DELETE",
      }),

      async onQueryStarted({ postId, username }, { dispatch, queryFulfilled }) {
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

      async onQueryStarted({ postId, username }, { dispatch, queryFulfilled }) {
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
            postApi.util.updateQueryData("getComments", { postId }, (draft) => {
              draft.items.unshift(data.comment);
            }),
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
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazyGetProfilePostsQuery,
  useGetProfilePostsQuery,
  useToggleLikeMutation,
  useDeletePostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useCreatePostMutation,
} = postApi;
