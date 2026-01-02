import { baseApi } from "@shared/api/baseApi";
import type { User } from "../types/userTypes";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserByUsername: builder.query<User, string>({
      query: (username) => `/users/${username}`,
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUserByUsernameQuery } = userApi;
