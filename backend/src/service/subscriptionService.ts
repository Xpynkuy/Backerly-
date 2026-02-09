import prisma from "../config/prisma";
import { savePost } from "../lib/imageProcessing";
import { deleteFile } from "../lib/files";
import {
  ServiceError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../errors/ServiceError";
import {
  TierDto,
  SubscribedAuthorDto,
  FetchTiersByUsernameParams,
  CreateTierParams,
  UpdateTierParams,
  DeleteTierParams,
  SubscribeParams,
  UnsubscribeParams,
  GetSubscriptionStatusParams,
  FetchSubscriptionsParams,
  TiersResponse,
  SubscriptionsResponse,
  SubscriptionStatusResponse,
  SubscribeResponse,
} from "../types/subscriptionTypes";

export const fetchTiersByUsername = async ({
  username,
}: FetchTiersByUsernameParams): Promise<TiersResponse> => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) throw new NotFoundError("User not found");

  const tiers = await prisma.subscriptionTier.findMany({
    where: { authorId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return { items: tiers as TierDto[] };
};

export const createTierForUser = async ({
  username,
  authUserId,
  title,
  description,
  priceCents,
  fileBuffer,
}: CreateTierParams): Promise<TierDto> => {
  if (!authUserId) throw new UnauthorizedError();
  if (!title?.trim()) throw new BadRequestError("Title is required");

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");
  if (author.id !== authUserId) throw new ForbiddenError();

  const imageUrl = fileBuffer ? await savePost(fileBuffer) : null;

  const tier = await prisma.subscriptionTier.create({
    data: {
      authorId: author.id,
      title: title.trim(),
      description: description?.trim() ?? null,
      imageUrl,
      priceCents: priceCents ?? null,
    },
  });

  return tier as TierDto;
};

export const updateTierById = async ({
  username,
  tierId,
  authUserId,
  title,
  description,
  priceCents,
  fileBuffer,
}: UpdateTierParams): Promise<TierDto> => {
  if (!authUserId) throw new UnauthorizedError();

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  const tier = await prisma.subscriptionTier.findUnique({
    where: { id: tierId },
  });

  if (!tier) throw new NotFoundError("Tier not found");

  if (tier.authorId !== author.id || author.id !== authUserId) {
    throw new ForbiddenError();
  }

  let imageUrl = tier.imageUrl ?? null;
  if (fileBuffer) {
    if (imageUrl) await deleteFile(imageUrl);
    imageUrl = await savePost(fileBuffer);
  }

  const updated = await prisma.subscriptionTier.update({
    where: { id: tierId },
    data: {
      title: title?.trim() ?? tier.title,
      description: description ?? tier.description,
      priceCents:
        priceCents !== undefined && priceCents !== null
          ? Number(priceCents)
          : tier.priceCents,
      imageUrl,
    },
  });

  return updated as TierDto;
};

export const deleteTierById = async ({
  username,
  tierId,
  authUserId,
}: DeleteTierParams): Promise<void> => {
  if (!authUserId) throw new UnauthorizedError();

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  const tier = await prisma.subscriptionTier.findUnique({
    where: { id: tierId },
  });

  if (!tier) throw new NotFoundError("Tier not found");

  if (tier.authorId !== author.id || author.id !== authUserId) {
    throw new ForbiddenError();
  }

  // Remove tier from posts (make them free)
  await prisma.post.updateMany({
    where: { accessTierId: tierId },
    data: { isPaid: false, accessTierId: null },
  });

  if (tier.imageUrl) {
    await deleteFile(tier.imageUrl);
  }

  await prisma.subscriptionTier.delete({ where: { id: tierId } });
};

export const subscribeToAuthorService = async ({
  username,
  authUserId,
  tierId,
}: SubscribeParams): Promise<SubscribeResponse> => {
  if (!authUserId) throw new UnauthorizedError();

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  if (author.id === authUserId) {
    throw new BadRequestError("Cannot subscribe to yourself");
  }

  const existing = await prisma.subscription.findFirst({
    where: { subscriberId: authUserId, authorId: author.id },
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: { tierId: tierId ?? null },
    });
  } else {
    await prisma.subscription.create({
      data: {
        subscriberId: authUserId,
        authorId: author.id,
        tierId: tierId ?? null,
      },
    });
  }

  return { subscribed: true };
};

export const unsubscribeFromAuthorService = async ({
  username,
  authUserId,
  tierId,
}: UnsubscribeParams): Promise<SubscribeResponse> => {
  if (!authUserId) throw new UnauthorizedError();

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  await prisma.subscription.deleteMany({
    where: {
      subscriberId: authUserId,
      authorId: author.id,
      ...(tierId ? { tierId } : {}),
    },
  });

  return { subscribed: false };
};

export const getSubscriptionStatusService = async ({
  username,
  authUserId,
}: GetSubscriptionStatusParams): Promise<SubscriptionStatusResponse> => {
  if (!authUserId) return { subscribed: false, tierId: null };

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  const sub = await prisma.subscription.findFirst({
    where: { subscriberId: authUserId, authorId: author.id },
    select: { tierId: true },
  });

  if (!sub) return { subscribed: false, tierId: null };

  return { subscribed: true, tierId: sub.tierId ?? null };
};

export const fetchSubscriptionsByUsername = async ({
  username,
  authUserId,
}: FetchSubscriptionsParams): Promise<SubscriptionsResponse> => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) throw new NotFoundError("User not found");

  // Only owner can view their subscriptions
  if (user.id !== authUserId) {
    throw new ForbiddenError("You can only view your own subscriptions");
  }

  const subs = await prisma.subscription.findMany({
    where: { subscriberId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bannerUrl: true,
          description: true,
        },
      },
      tier: {
        select: { id: true, title: true },
      },
    },
  });

  const items: SubscribedAuthorDto[] = subs.map((s) => ({
    id: s.author.id,
    username: s.author.username,
    avatarUrl: s.author.avatarUrl ?? null,
    bannerUrl: s.author.bannerUrl ?? null,
    description: s.author.description ?? null,
    tierId: s.tierId ?? null,
    tierTitle: s.tier?.title ?? null,
  }));

  return { items };
};
