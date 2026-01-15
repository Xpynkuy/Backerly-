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
    }),

    toggleLike: builder.mutation<
      { liked: boolean; likesCount: number },
      { postId: string }
    >({
      query: ({ postId }) => ({
        url: `/posts/${postId}/like`,
        method: "POST",
      }),
    }),

    getComments: builder.query<{ items: Comment[] }, { postId: string }>({
      query: ({ postId }) => ({
        url: `/posts/${postId}/comments`,
        method: "GET",
      }),
    }),

    addComment: builder.mutation<
      { comment: Comment; commentsCount: number },
      { postId: string; text: string }
    >({
      query: ({ postId, text }) => ({
        url: `/posts/${postId}/comments`,
        method: "POST",
        body: { text },
      }),
    }),

    createPost: builder.mutation<
      any,
      {
        username: string;
        title: string;
        description: string;
        image?: File | null;
      }
    >({
      query: ({ username, title, description, image }) => {
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        if (image) form.append("image", image);

        return {
          url: `/users/${username}/posts`,
          method: "POST",
          body: form,
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazyGetProfilePostsQuery,
  useGetProfilePostsQuery,
  useToggleLikeMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useCreatePostMutation,
} = postApi;
