import { baseApi } from "@shared/api/baseApi";
import type { User } from "../types/userTypes";

type UserTag = { type: "User"; id: string };

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserByUsername: builder.query<User, string>({
      query: (username) => `/users/${username}`,
      providesTags: (result, error, username): UserTag[] => [
        { type: "User", id: username },
      ],
    }),

    updateDescription: builder.mutation<
      User,
      { username: string; description: string | null }
    >({
      query: ({ username, description }) => ({
        url: `/users/${username}/description`,
        method: "PATCH",
        body: { description },
      }),
      invalidatesTags: (result, error, { username }) => [
        { type: "User", id: username },
        "AuthMe",
      ],
    }),

    updateAvatar: builder.mutation<User, { username: string; file: File }>({
      query: ({ username, file }) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return {
          url: `/users/${username}/avatar`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { username }) => [
        { type: "User", id: username },
        "AuthMe",
      ],
    }),

    updateBanner: builder.mutation<User, { username: string; file: File }>({
      query: ({ username, file }) => {
        const formData = new FormData();
        formData.append("banner", file);
        return {
          url: `/users/${username}/banner`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { username }): UserTag[] => [
        { type: "User", id: username },
      ],
    }),

    searchUsers: builder.query<{ items: User[] }, { query: string }>({
      query: ({ query }) => ({
        url: `/users/search`,
        method: "GET",
        params: { q: query },
      }),
    }),

    activateCreator: builder.mutation<User, void>({
      query: () => ({
        url: `/users/activate-creator`,
        method: "POST",
      }),
      invalidatesTags: (result) =>
        result ? ["AuthMe", { type: "User", id: result.username }] : ["AuthMe"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserByUsernameQuery,
  useUpdateAvatarMutation,
  useUpdateBannerMutation,
  useUpdateDescriptionMutation,
  useLazySearchUsersQuery,
  useActivateCreatorMutation,
} = userApi;
