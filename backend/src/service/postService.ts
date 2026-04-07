import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { savePost } from "../lib/imageProcessing";
import { deleteFile } from "../lib/files";
import {
  PostDto,
  CreatePostParams,
  FetchPostsParams,
  DeletePostParams,
  UpdatePostParams,
  FetchFeedParams,
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

const postSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  tags: true,
  createdAt: true,
  isPaid: true,
  accessTierId: true,
  accessTier: { select: { id: true, title: true, priceCents: true } },
  author: { select: { id: true, username: true, avatarUrl: true } },
  _count: { select: { likes: true, comments: true } },
};

export const fetchPostsByUsername = async ({
  username,
  take,
  cursor,
  authUserId,
  tag,
}: FetchPostsParams): Promise<PaginatedResponse<PostDto>> => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: user.id,
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: postSelect,
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
          select: {
            tierId: true,
            status: true,
            expiresAt: true,
            tier: { select: { priceCents: true } },
          },
        })
      : null;

 const isSubActive =
    subscription &&
    (subscription.status === "active" || subscription.status === "cancelled") &&
    (!subscription.expiresAt || new Date() < subscription.expiresAt);

  const subTierPrice = isSubActive
    ? subscription?.tier?.priceCents ?? 0
    : 0;

  const hasMore = posts.length > take;
  const itemsRaw = hasMore ? posts.slice(0, take) : posts;

  const items = itemsRaw.map((p) => {
    const isAuthor = authUserId && String(authUserId) === String(user.id);
    let locked = false;

    if (p.isPaid && !isAuthor) {
      if (!isSubActive) {
        locked = true;
      } else {
        const postTierPrice = (p.accessTier as any)?.priceCents ?? 0;
        if (subTierPrice < postTierPrice) {
          locked = true;
        }
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
  tags,
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
      tags: tags ?? [],
      isPaid,
      accessTierId: isPaid ? accessTierId : undefined,
    },
    select: postSelect,
  });

  try {
    const activeSubs = await prisma.subscription.findMany({
      where: {
        authorId: targetUser.id,
        status: "active",
      },
      select: { subscriberId: true },
    });

    if (activeSubs.length > 0) {
      await prisma.notification.createMany({
        data: activeSubs.map((sub) => ({
          userId: sub.subscriberId,
          type: "new_post",
          postId: post.id,
          authorName: username,
          message: `${username} published a new post: "${post.title}"`,
        })),
      });
    }
  } catch (e) {
    console.error("Failed to create notifications", e);
  }

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

export const updatePostById = async ({
  postId,
  authUserId,
  title,
  description,
  isPaid,
  accessTierId,
  tags,
  fileBuffer,
  removeImage,
}: UpdatePostParams) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      imageUrl: true,
      author: { select: { username: true } },
    },
  });

  if (!post) throw new NotFoundError("Post not found");
  if (post.authorId !== authUserId) {
    throw new ForbiddenError("You are not allowed to edit this post");
  }

  if (isPaid && accessTierId) {
    const tier = await prisma.subscriptionTier.findUnique({
      where: { id: accessTierId },
      select: { authorId: true },
    });
    if (!tier || tier.authorId !== post.authorId) {
      throw new BadRequestError("Invalid access tier");
    }
  }

  let imageUrl = post.imageUrl;
  if (removeImage && imageUrl) {
    try { await deleteFile(imageUrl); } catch (_) {}
    imageUrl = null;
  }
  if (fileBuffer) {
    if (imageUrl) {
      try { await deleteFile(imageUrl); } catch (_) {}
    }
    imageUrl = await savePost(fileBuffer);
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(title != null ? { title: title.trim() } : {}),
      ...(description != null ? { description: description.trim() } : {}),
      ...(isPaid !== undefined ? { isPaid } : {}),
      ...(tags !== undefined ? { tags } : {}),
      accessTierId: isPaid ? (accessTierId ?? null) : null,
      imageUrl,
    },
    select: postSelect,
  });

  return updated;
};

export const fetchFeed = async ({
  authUserId,
  take,
  cursor,
  tag,
}: FetchFeedParams): Promise<PaginatedResponse<PostDto>> => {
  const subs = await prisma.subscription.findMany({
    where: {
      subscriberId: authUserId,
      status: { in: ["active", "cancelled"] },
    },
    select: {
      authorId: true,
      tierId: true,
      status: true,
      expiresAt: true,
      tier: { select: { priceCents: true } },
    },
  });

  const now = new Date();
    const activeSubs = subs.filter(
    (s) =>
      s.status === "active" ||
      (s.status === "cancelled" && s.expiresAt && now < s.expiresAt),
  );

  if (activeSubs.length === 0) {
    return { items: [], nextCursor: null };
  }

  const authorIds = activeSubs.map((s) => s.authorId);

  const posts = await prisma.post.findMany({
    where: {
      authorId: { in: authorIds },
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: postSelect,
  });

  const postIds = posts.map((p) => p.id);

  const likedRows =
    postIds.length > 0
      ? await prisma.postLike.findMany({
          where: { postId: { in: postIds }, userId: authUserId },
          select: { postId: true },
        })
      : [];
  const likedSet = new Set(likedRows.map((r) => r.postId));

  const subByAuthor = new Map(
    activeSubs.map((s) => [s.authorId, s.tier?.priceCents ?? 0]),
  );

  const hasMore = posts.length > take;
  const itemsRaw = hasMore ? posts.slice(0, take) : posts;

  const items = itemsRaw.map((p) => {
    let locked = false;
    if (p.isPaid) {
      const subPrice = subByAuthor.get(p.author.id) ?? 0;
      const postPrice = (p.accessTier as any)?.priceCents ?? 0;
      if (subPrice < postPrice) locked = true;
    }
    return { ...p, liked: likedSet.has(p.id), locked } as PostDto;
  });

  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
};