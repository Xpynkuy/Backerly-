import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { getAuthUserId } from "../utils/getAuthUserId";

export const requireCreator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUserId },
      select: { isCreator: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isCreator) {
      return res.status(403).json({
        error: "Creator mode is not activated",
        code: "CREATOR_MODE_REQUIRED",
      });
    }

    return next();
  } catch (e) {
    console.error("requireCreator error", e);
    return res.status(500).json({ error: "Server error" });
  }
};
