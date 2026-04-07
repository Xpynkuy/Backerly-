import { baseApi } from "@shared/api/baseApi";
import type {
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionUser,
} from "../types/types";

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTiers: builder.query<
      { items: SubscriptionTier[] },
      { username: string }
    >({
      query: ({ username }) => ({
        url: `/users/${username}/tiers`,
        method: "GET",
      }),
      providesTags: (_r, _e, { username }) => [
        { type: "Tiers" as const, id: username },
      ],
    }),

    createTier: builder.mutation<
      SubscriptionTier,
      { username: string; form: FormData }
    >({
      query: ({ username, form }) => ({
        url: `/users/${username}/tiers`,
        method: "POST",
        body: form,
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "Tiers" as const, id: username },
      ],
    }),

    updateTier: builder.mutation<
      SubscriptionTier,
      { username: string; tierId: string; form: FormData }
    >({
      query: ({ username, tierId, form }) => ({
        url: `/users/${username}/tiers/${tierId}`,
        method: "PUT",
        body: form,
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "Tiers" as const, id: username },
      ],
    }),

    deleteTier: builder.mutation<void, { username: string; tierId: string }>({
      query: ({ username, tierId }) => ({
        url: `/users/${username}/tiers/${tierId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "Tiers" as const, id: username },
      ],
    }),

    getSubscriptions: builder.query<
      { items: SubscriptionUser[] },
      { username: string }
    >({
      query: ({ username }) => ({
        url: `/users/${username}/subscriptions`,
        method: "GET",
      }),
      providesTags: (_r, _e, { username }) => [
        { type: "Subscriptions" as const, id: username },
      ],
    }),

    subscribe: builder.mutation<
      { subscribed: boolean; status: string; expiresAt: string | null },
      { username: string; tierId?: string | null }
    >({
      query: ({ username, tierId }) => ({
        url: `/users/${username}/subscribe`,
        method: "POST",
        body: { tierId },
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "SubscriptionStatus" as const, id: username },
        "Subscriptions" as any,
        { type: "Posts" as const, id: username },
        { type: "Tiers" as const, id: username },
        { type: "User" as const, id: username },
      ],
    }),

    follow: builder.mutation<
      { subscribed: boolean; status: string; expiresAt: string | null },
      { username: string }
    >({
      query: ({ username }) => ({
        url: `/users/${username}/subscribe`,
        method: "POST",
        body: { tierId: null },
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "SubscriptionStatus" as const, id: username },
        "Subscriptions" as any,
        { type: "Posts" as const, id: username },
        { type: "Tiers" as const, id: username },
        { type: "User" as const, id: username },
      ],
    }),

    unfollow: builder.mutation<
      { subscribed: boolean; status: string; expiresAt: string | null },
      { username: string }
    >({
      query: ({ username }) => ({
        url: `/users/${username}/unsubscribe`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "SubscriptionStatus" as const, id: username },
        "Subscriptions" as any,
        { type: "Posts" as const, id: username },
        { type: "Tiers" as const, id: username },
        { type: "User" as const, id: username },
      ],
    }),

    unsubscribe: builder.mutation<
      { subscribed: boolean; status: string; expiresAt: string | null },
      { username: string }
    >({
      query: ({ username }) => ({
        url: `/users/${username}/unsubscribe`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { username }) => [
        { type: "SubscriptionStatus" as const, id: username },
        "Subscriptions" as any,
        { type: "Posts" as const, id: username },
        { type: "Tiers" as const, id: username },
        { type: "User" as const, id: username },
      ],
    }),

    getSubscriptionStatus: builder.query<
      SubscriptionStatus,
      { username: string }
    >({
      query: ({ username }) => ({
        url: `/users/${username}/subscription-status`,
        method: "GET",
      }),
      providesTags: (_r, _e, { username }) => [
        { type: "SubscriptionStatus" as const, id: username },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetTiersQuery,
  useCreateTierMutation,
  useUpdateTierMutation,
  useDeleteTierMutation,
  useGetSubscriptionsQuery,
  useFollowMutation,
  useUnfollowMutation,
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscriptionStatusQuery,
} = subscriptionApi;
