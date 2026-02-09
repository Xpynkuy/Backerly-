import { Request, Response } from "express";
import { getAuthUserId } from "../utils/getAuthUserId";
import {
  getUserByUsername,
  updateUserDescription,
  updateUserAvatar,
  updateUserBanner,
  searchUsers,
} from "../service/userService";
import { ServiceError } from "../errors/ServiceError";

export const getUserByUsernameController = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await getUserByUsername(username);
    return res.json(user);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("getUserByUsername error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateDescriptionByUsername = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const { description } = req.body as { description?: string | null };

    const updated = await updateUserDescription({
      username,
      authUserId,
      description,
    });

    return res.json(updated);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("updateDescription error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateAvatarByUsername = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    if (!req.file) return res.status(400).json({ error: "Avatar file is required" });

    const { username } = req.params;

    const updated = await updateUserAvatar({
      username,
      authUserId,
      fileBuffer: req.file.buffer,
    });

    return res.json(updated);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("updateAvatar error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateBannerByUsername = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    if (!req.file) return res.status(400).json({ error: "Banner file is required" });

    const { username } = req.params;

    const updated = await updateUserBanner({
      username,
      authUserId,
      fileBuffer: req.file.buffer,
    });

    return res.json(updated);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("updateBanner error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const searchUsersController = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string | undefined) ?? "";
    const result = await searchUsers({ query });
    return res.json(result);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("searchUsers error", e);
    return res.status(500).json({ error: "Server error" });
  }
};