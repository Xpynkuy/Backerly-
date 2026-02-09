import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { savePost } from "../lib/imageProcessing";
import { deleteFile } from "../lib/files";
import {
  PostDto,
  CreatePostParams,
  FetchPostsParams,
  DeletePostParams,
  ToggleLikeParams,
  AddCommentParams,
  GetCommentsParams,
  PaginatedResponse,
  ToggleLikeResult,
  AddCommentResult,
  CommentDto,
} from "../types/postTypes";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../errors/ServiceError";

export const fetchPostsByUsername = async ({
  username,
  take,
  cursor,
  authUserId,
}: FetchPostsParams): Promise<PaginatedResponse<PostDto>> => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const posts = await prisma.post.findMany({
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
      isPaid: true,
      accessTierId: true,
      accessTier: { select: { id: true, title: true } },
      author: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const postIds = posts.map((p) => p.id);

  const likedRows =
    authUserId && postIds.length > 0
      ? await prisma.postLike.findMany({
          where: { postId: { in: postIds }, userId: authUserId },
          select: { postId: true },
        })
      : [];

  const likedSet = new Set(likedRows.map((r) => r.postId));

  const subscription =
    authUserId && String(authUserId) !== String(user.id)
      ? await prisma.subscription.findFirst({
          where: { subscriberId: authUserId, authorId: user.id },
          select: { tierId: true },
        })
      : null;

  const hasMore = posts.length > take;
  const itemsRaw = hasMore ? posts.slice(0, take) : posts;

  const items = itemsRaw.map((p) => {
    const isAuthor = authUserId && String(authUserId) === String(user.id);
    let locked = false;

    if (p.isPaid && !isAuthor) {
      if (!subscription) {
        locked = true;
      } else if (
        subscription.tierId &&
        subscription.tierId !== p.accessTierId
      ) {
        locked = true;
      }
    }

    return {
      ...p,
      liked: likedSet.has(p.id),
      locked,
    } as PostDto;
  });

  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
};

export const createPostForUser = async ({
  username,
  authUserId,
  title,
  description,
  isPaid,
  accessTierId,
  fileBuffer,
}: CreatePostParams) => {
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  if (targetUser.id !== authUserId) {
    throw new ForbiddenError("You cannot create posts for another user");
  }

  if (isPaid) {
    if (!accessTierId) {
      throw new BadRequestError("Paid post must have accessTierId");
    }

    const tier = await prisma.subscriptionTier.findUnique({
      where: { id: accessTierId },
      select: { authorId: true },
    });

    if (!tier || tier.authorId !== targetUser.id) {
      throw new BadRequestError("Invalid access tier");
    }
  }

  const imageUrl = fileBuffer ? await savePost(fileBuffer) : null;

  const post = await prisma.post.create({
    data: {
      authorId: targetUser.id,
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl ?? undefined,
      isPaid,
      accessTierId: isPaid ? accessTierId : undefined,
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      isPaid: true,
      accessTierId: true,
      accessTier: { select: { id: true, title: true } },
      author: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return post;
};

export const deletePostById = async ({
  postId,
  authUserId,
}: DeletePostParams): Promise<void> => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, imageUrl: true },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.authorId !== authUserId) {
    throw new ForbiddenError("You are not allowed to delete this post");
  }

  if (post.imageUrl) {
    try {
      await deleteFile(post.imageUrl);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  }

  await prisma.post.delete({ where: { id: postId } });
};

export const toggleLikeForPost = async ({
  postId,
  authUserId,
}: ToggleLikeParams): Promise<ToggleLikeResult> => {
  let liked: boolean;

  try {
    await prisma.postLike.create({
      data: { postId, userId: authUserId },
    });
    liked = true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      await prisma.postLike.delete({
        where: {
          postId_userId: { postId, userId: authUserId },
        },
      });
      liked = false;
    } else {
      throw error;
    }
  }

  const likesCount = await prisma.postLike.count({
    where: { postId },
  });

  return { liked, likesCount };
};

export const getCommentsForPost = async ({
  postId,
}: GetCommentsParams): Promise<CommentDto[]> => {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      text: true,
      createdAt: true,
      author: { select: { username: true, avatarUrl: true } },
    },
  });

  return comments;
};

export const addCommentToPost = async ({
  postId,
  authUserId,
  text,
}: AddCommentParams): Promise<AddCommentResult> => {
  const postExists = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!postExists) {
    throw new NotFoundError("Post not found");
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: authUserId,
      text: text.trim(),
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      author: { select: { username: true, avatarUrl: true } },
    },
  });

  const commentsCount = await prisma.comment.count({
    where: { postId },
  });

  return { comment, commentsCount };
};
