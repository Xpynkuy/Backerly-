import prisma from "../config/prisma";

export interface NotificationDto {
  id: string;
  type: string;
  postId: string | null;
  authorName: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export const fetchNotifications = async (
  userId: string,
  take: number = 20,
  cursor?: string,
): Promise<{ items: NotificationDto[]; nextCursor: string | null }> => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      type: true,
      postId: true,
      authorName: true,
      message: true,
      isRead: true,
      createdAt: true,
    },
  });

  const hasMore = notifications.length > take;
  const items = hasMore ? notifications.slice(0, take) : notifications;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};

export const markNotificationsRead = async (
  userId: string,
  notificationIds?: string[],
): Promise<number> => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
      ...(notificationIds ? { id: { in: notificationIds } } : {}),
    },
    data: { isRead: true },
  });
  return result.count;
};
