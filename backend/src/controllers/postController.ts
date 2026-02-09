import { Request, Response, NextFunction } from "express";
import {
  fetchPostsByUsername,
  createPostForUser,
  deletePostById,
  toggleLikeForPost,
  getCommentsForPost,
  addCommentToPost,
} from "../service/postService";
import { getAuthUserId } from "../utils/getAuthUserId";
import { parseBoolean, parsePositiveInt } from "../utils/parsers";
import { UnauthorizedError } from "../errors/ServiceError";

export const getPostsByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username } = req.params;
    const take = parsePositiveInt(req.query.take, 5, 1, 30);
    const cursor = (req.query.cursor as string | undefined) ?? undefined;
    const authUserId = getAuthUserId(req);

    const result = await fetchPostsByUsername({
      username,
      take,
      cursor,
      authUserId: authUserId ?? undefined,
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createPostByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);

    if (!authUserId) {
      throw new UnauthorizedError();
    }

    const { username } = req.params;
    const { title, description } = req.body;
    const isPaid = parseBoolean(req.body.isPaid);
    const accessTierId = (req.body.accessTierId as string | undefined) ?? null;
    const fileBuffer = req.file?.buffer;

    const post = await createPostForUser({
      username,
      authUserId,
      title: title.trim(),
      description: description.trim(),
      isPaid,
      accessTierId,
      fileBuffer,
    });

    return res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);

    if (!authUserId) {
      throw new UnauthorizedError();
    }

    const postId = req.params.id;

    await deletePostById({ postId, authUserId });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);

    if (!authUserId) {
      throw new UnauthorizedError();
    }

    const postId = req.params.id;

    const result = await toggleLikeForPost({ postId, authUserId });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = req.params.id;
    const items = await getCommentsForPost({ postId });

    return res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);

    if (!authUserId) {
      throw new UnauthorizedError();
    }

    const postId = req.params.id;
    const { text } = req.body;

    const result = await addCommentToPost({
      postId,
      authUserId,
      text: text.trim(),
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
