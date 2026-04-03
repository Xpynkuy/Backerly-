import { Request, Response } from "express";
import { getAuthUserId } from "../utils/getAuthUserId";
import {
  fetchNotifications,
  getUnreadCount,
  markNotificationsRead,
} from "../service/notificationService";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const take = Math.min(Number(req.query.take) || 20, 50);
    const cursor = (req.query.cursor as string) || undefined;

    const result = await fetchNotifications(authUserId, take, cursor);
    return res.json(result);
  } catch (e: any) {
    console.error("getNotifications error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getNotificationsCount = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const count = await getUnreadCount(authUserId);
    return res.json({ count });
  } catch (e: any) {
    console.error("getNotificationsCount error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { ids } = req.body as { ids?: string[] };
    const count = await markNotificationsRead(authUserId, ids);
    return res.json({ marked: count });
  } catch (e: any) {
    console.error("markRead error", e);
    return res.status(500).json({ error: "Server error" });
  }
};
