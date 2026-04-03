import { baseApi } from "@shared/api/baseApi";

export interface NotificationItem {
  id: string;
  type: string;
  postId: string | null;
  authorName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      { items: NotificationItem[]; nextCursor: string | null },
      { take?: number; cursor?: string | null }
    >({
      query: ({ take = 20, cursor }) => ({
        url: "/notifications",
        method: "GET",
        params: { take, cursor: cursor ?? undefined },
      }),
      providesTags: ["Notifications" as any],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => ({
        url: "/notifications/count",
        method: "GET",
      }),
      providesTags: ["NotificationCount" as any],
    }),

    markNotificationsRead: builder.mutation<
      { marked: number },
      { ids?: string[] }
    >({
      query: ({ ids }) => ({
        url: "/notifications/read",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Notifications" as any, "NotificationCount" as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationsReadMutation,
} = notificationApi;
