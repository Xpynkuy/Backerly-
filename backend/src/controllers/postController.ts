import { Request, Response } from "express";
import prisma from "../config/prisma";
import { savePost } from "../lib/imageProcessing";

function getAuthUserId(req: Request): string | undefined {
  return (req as any).user?.userId as string | undefined;
}

export const getPostsByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const takeRaw = Number(req.query.take ?? 5);
    const take = Math.min(Math.max(takeRaw, 1), 30);
    const cursor = (req.query.cursor as string | undefined) ?? undefined;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const post = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        author: { select: { username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    const hasMore = post.length > take;
    const items = hasMore ? post.slice(0, take) : post;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return res.json({ items, nextCursor });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};

export const createPostByUsername = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    const { username } = req.params;
    const { title, description } = req.body as {
      title?: string;
      description?: string;
    };

    if (!authUserId) return res.status(404).json({ error: "Unauthorized" });

    if (!title?.trim())
      return res.status(400).json({ error: "Title is required" });
    if (!description?.trim())
      return res.status(400).json({ error: "Description is required" });

    // 6. Находим профиль, куда публикуем
    const target = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!target) return res.status(404).json({ error: "User not found" });

    // 7. Проверяем право: можно создавать пост только в своём профиле
    if (target.id !== authUserId) {
      return res
        .status(403)
        .json({ error: "You cannot create posts for чужой профиль" });
    }
    const imageUrl = req.file ? await savePost(req.file.buffer) : null;

    // 9. Создаём пост в БД
    const post = await prisma.post.create({
      data: {
        authorId: target.id,
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl ?? undefined,
      },

      // 10. Возвращаем DTO сразу
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        author: { select: { username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // 11. Ответ 201 Created
    return res.status(201).json(post);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    // 1. Авторизованный пользователь
    const authUserId = getAuthUserId(req);

    // 2. id поста
    const postId = req.params.id;

    // 3. Если не авторизован — нельзя
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    // 4. Проверяем: есть ли уже лайк (postId + userId уникальная пара)
    const exists = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: authUserId } },
    });

    let liked: boolean;

    // 5. Если лайк был — удаляем
    if (exists) {
      await prisma.postLike.delete({
        where: { postId_userId: { postId, userId: authUserId } },
      });
      liked = false;
    } else {
      // 6. Если лайка не было — создаём
      await prisma.postLike.create({
        data: { postId, userId: authUserId },
      });
      liked = true;
    }

    // 7. Считаем актуальное число лайков
    const likesCount = await prisma.postLike.count({ where: { postId } });

    // 8. Возвращаем состояние и счётчик
    return res.json({ liked, likesCount });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};

// ------------------------------------------------------------
// 4) GET COMMENTS
// GET /api/posts/:id/comments
// ------------------------------------------------------------
export const getComments = async (req: Request, res: Response) => {
  try {
    // 1. postId из params
    const postId = req.params.id;

    // 2. Запрашиваем все комменты поста
    const items = await prisma.comment.findMany({
      where: { postId },

      // 3. сортируем по возрастанию времени: старые сверху, новые снизу
      orderBy: { createdAt: "asc" },

      // 4. DTO
      select: {
        id: true,
        text: true,
        createdAt: true,
        author: { select: { username: true, avatarUrl: true } },
      },
    });

    return res.json({ items });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};

// ------------------------------------------------------------
// 5) ADD COMMENT
// POST /api/posts/:id/comments
// body: { text }
// ------------------------------------------------------------
export const addComment = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    const postId = req.params.id;

    // text приходит из JSON body (express.json)
    const { text } = req.body as { text?: string };

    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    if (!text?.trim()) return res.status(400).json({ error: "Text is required" });

    // 1. создаём комментарий
    const comment = await prisma.comment.create({
      data: { postId, authorId: authUserId, text: text.trim() },
      select: {
        id: true,
        text: true,
        createdAt: true,
        author: { select: { username: true, avatarUrl: true } },
      },
    });

    // 2. считаем актуальный счётчик комментариев
    const commentsCount = await prisma.comment.count({ where: { postId } });

    // 3. возвращаем
    return res.status(201).json({ comment, commentsCount });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};
