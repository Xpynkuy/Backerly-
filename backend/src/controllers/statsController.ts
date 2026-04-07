import { Request, Response } from "express";
import { getAuthUserId } from "../utils/getAuthUserId";
import { getAuthorStats } from "../service/statsService";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const stats = await getAuthorStats(authUserId);
    return res.json(stats);
  } catch (e: any) {
    console.error("getDashboardStats error", e);
    return res.status(500).json({ error: "Server error" });
  }
};
