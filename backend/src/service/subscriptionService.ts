import prisma from "../config/prisma";
import { savePost } from "../lib/imageProcessing";
import { deleteFile } from "../lib/files";
import {
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

const SUBSCRIPTION_DURATION_DAYS = 30;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSubscriptionActive(sub: {
  status: string;
  expiresAt: Date | null;
}): boolean {
  if (sub.status !== "active") return false;
  if (!sub.expiresAt) return true;
  return new Date() < sub.expiresAt;
}

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
    orderBy: [
      { priceCents: "asc" },
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      _count: {
        select: {
          subscriptions: {
            where: { status: "active" },
          },
        },
      },
    },
  });

  const items: TierDto[] = tiers.map((t) => ({
    id: t.id,
    authorId: t.authorId,
    title: t.title,
    description: t.description,
    imageUrl: t.imageUrl,
    priceCents: t.priceCents,
    sortOrder: t.sortOrder,
    isActive: t.isActive,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    subscriberCount: t._count.subscriptions,
  }));

  return { items };
};

export const createTierForUser = async ({
  username,
  authUserId,
  title,
  description,
  priceCents,
  sortOrder,
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

  let order = sortOrder ?? 0;
  if (!sortOrder && priceCents) {
    const existingTiers = await prisma.subscriptionTier.count({
      where: { authorId: author.id, isActive: true },
    });
    order = existingTiers + 1;
  }

  const tier = await prisma.subscriptionTier.create({
    data: {
      authorId: author.id,
      title: title.trim(),
      description: description?.trim() ?? null,
      imageUrl,
      priceCents: priceCents ?? null,
      sortOrder: order,
    },
  });

  return { ...tier, subscriberCount: 0 } as TierDto;
};

export const updateTierById = async ({
  username,
  tierId,
  authUserId,
  title,
  description,
  priceCents,
  sortOrder,
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
      description: description !== undefined ? description : tier.description,
      priceCents:
        priceCents !== undefined && priceCents !== null
          ? Number(priceCents)
          : tier.priceCents,
      sortOrder:
        sortOrder !== undefined && sortOrder !== null
          ? Number(sortOrder)
          : tier.sortOrder,
      imageUrl,
    },
    include: {
      _count: {
        select: {
          subscriptions: {
            where: { status: "active" },
          },
        },
      },
    },
  });

  return {
    id: updated.id,
    authorId: updated.authorId,
    title: updated.title,
    description: updated.description,
    imageUrl: updated.imageUrl,
    priceCents: updated.priceCents,
    sortOrder: updated.sortOrder,
    isActive: updated.isActive,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    subscriberCount: updated._count.subscriptions,
  };
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

  await prisma.post.updateMany({
    where: { accessTierId: tierId },
    data: { isPaid: false, accessTierId: null },
  });

  await prisma.subscription.updateMany({
    where: { tierId, status: "active" },
    data: { status: "cancelled", cancelledAt: new Date() },
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

  if (tierId) {
    const tier = await prisma.subscriptionTier.findUnique({
      where: { id: tierId },
      select: { authorId: true, isActive: true },
    });
    if (!tier || tier.authorId !== author.id) {
      throw new BadRequestError("Invalid tier");
    }
    if (!tier.isActive) {
      throw new BadRequestError("This tier is no longer available");
    }
  }

  const now = new Date();
  const expiresAt = addDays(now, SUBSCRIPTION_DURATION_DAYS);

  const existing = await prisma.subscription.findFirst({
    where: { subscriberId: authUserId, authorId: author.id },
  });

  if (existing) {
    const updateData: any = {
      tierId: tierId ?? null,
      status: "active",
      cancelledAt: null,
    };

    if (!isSubscriptionActive(existing)) {
      updateData.startDate = now;
      updateData.expiresAt = expiresAt;
    } else if (existing.tierId !== tierId) {
    }

    await prisma.subscription.update({
      where: { id: existing.id },
      data: updateData,
    });

    return {
      subscribed: true,
      status: "active",
      expiresAt:
        (updateData.expiresAt ?? existing.expiresAt)?.toISOString() ?? null,
    };
  }

  const sub = await prisma.subscription.create({
    data: {
      subscriberId: authUserId,
      authorId: author.id,
      tierId: tierId ?? null,
      status: "active",
      startDate: now,
      expiresAt,
    },
  });

  return {
    subscribed: true,
    status: "active",
    expiresAt: sub.expiresAt?.toISOString() ?? null,
  };
};

export const unsubscribeFromAuthorService = async ({
  username,
  authUserId,
}: UnsubscribeParams): Promise<SubscribeResponse> => {
  if (!authUserId) throw new UnauthorizedError();

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  const existing = await prisma.subscription.findFirst({
    where: { subscriberId: authUserId, authorId: author.id },
  });

  if (!existing) {
    return { subscribed: false, status: "none", expiresAt: null };
  }

  await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  return {
    subscribed: false,
    status: "cancelled",
    expiresAt: existing.expiresAt?.toISOString() ?? null,
  };
};

export const getSubscriptionStatusService = async ({
  username,
  authUserId,
}: GetSubscriptionStatusParams): Promise<SubscriptionStatusResponse> => {
  const empty: SubscriptionStatusResponse = {
    subscribed: false,
    tierId: null,
    tierTitle: null,
    tierPriceCents: null,
    status: null,
    expiresAt: null,
  };

  if (!authUserId) return empty;

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  const sub = await prisma.subscription.findFirst({
    where: { subscriberId: authUserId, authorId: author.id },
    include: {
      tier: { select: { id: true, title: true, priceCents: true } },
    },
  });

  if (!sub) return empty;

  const active = isSubscriptionActive(sub);

  if (sub.status === "active" && !active) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "expired" },
    });
  }

  const effectiveStatus =
    sub.status === "active" && !active ? "expired" : sub.status;

  return {
    subscribed: effectiveStatus === "active" || effectiveStatus === "cancelled",
    tierId: sub.tierId ?? null,
    tierTitle: sub.tier?.title ?? null,
    tierPriceCents: sub.tier?.priceCents ?? null,
    status: effectiveStatus,
    expiresAt: sub.expiresAt?.toISOString() ?? null,
  };
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
        select: { id: true, title: true, priceCents: true },
      },
    },
  });

  const now = new Date();
  for (const s of subs) {
    if (s.status === "active" && s.expiresAt && now >= s.expiresAt) {
      await prisma.subscription.update({
        where: { id: s.id },
        data: { status: "expired" },
      });
      s.status = "expired";
    }
  }

  const items: SubscribedAuthorDto[] = subs.map((s) => ({
    id: s.author.id,
    username: s.author.username,
    avatarUrl: s.author.avatarUrl ?? null,
    bannerUrl: s.author.bannerUrl ?? null,
    description: s.author.description ?? null,
    tierId: s.tierId ?? null,
    tierTitle: s.tier?.title ?? null,
    tierPriceCents: s.tier?.priceCents ?? null,
    status: s.status,
    startDate: s.startDate.toISOString(),
    expiresAt: s.expiresAt?.toISOString() ?? null,
    cancelledAt: s.cancelledAt?.toISOString() ?? null,
  }));

  return { items };
};
