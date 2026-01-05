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
      invalidatesTags: (result, error, { username }): UserTag[] => [
        { type: "User", id: username },
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
  }),
  overrideExisting: false,
});

export const {
  useGetUserByUsernameQuery,
  useUpdateAvatarMutation,
  useUpdateBannerMutation,
} = userApi;
