import { Request, Response } from "express";
import { saveAvatar, saveBanner } from "../lib/imageProcessing";
import { safeUnlink, urlToAbsoluteUploadPath } from "../lib/files";
import prisma from "../config/prisma";

function getAuthUserId(req: Request): string | undefined {
  return (req as any).user?.userId as string | undefined;
}

export const getUserByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await prisma?.user.findUnique({
      where: { username },
      select: { id: true, username: true, createdAt: true, avatarUrl: true, bannerUrl: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};


export const updateAvatarByUsername = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    const { username } = req.params;

    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    if (!req.file) return res.status(400).json({ error: "Avatar file is required" });

    // 1) кого обновляем
    const target = await prisma.user.findUnique({
      where: { username },
      select: { id: true, avatarUrl: true, username: true },
    });

    if (!target) return res.status(404).json({ error: "User not found" });

    // 2) защита: только свой профиль
    if (target.id !== authUserId) {
      return res.status(403).json({ error: "You cannot edit чужой профиль" });
    }

    // 3) сохраняем новый аватар (sharp)
    const newAvatarUrl = await saveAvatar(req.file.buffer);

    // 4) удаляем старый файл (если был)
    if (target.avatarUrl) {
      const oldPath = urlToAbsoluteUploadPath(target.avatarUrl);
      safeUnlink(oldPath);
    }

    // 5) пишем в БД
    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { avatarUrl: newAvatarUrl },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bannerUrl: true,
      },
    });

    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};

/**
 * ✅ PATCH /api/users/:username/banner
 * Полностью аналогично аватару, но другой размер/папка/ключ
 */
export const updateBannerByUsername = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    const { username } = req.params;

    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    if (!req.file) return res.status(400).json({ error: "Banner file is required" });

    const target = await prisma.user.findUnique({
      where: { username },
      select: { id: true, bannerUrl: true, username: true },
    });

    if (!target) return res.status(404).json({ error: "User not found" });

    if (target.id !== authUserId) {
      return res.status(403).json({ error: "You cannot edit чужой профиль" });
    }

    const newBannerUrl = await saveBanner(req.file.buffer);

    if (target.bannerUrl) {
      const oldPath = urlToAbsoluteUploadPath(target.bannerUrl);
      safeUnlink(oldPath);
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { bannerUrl: newBannerUrl },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bannerUrl: true,
      },
    });

    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};