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
  FollowAuthorParams,
  UnfollowAuthorParams,
  SubscribeToTierParams,
  CancelPaidSubscriptionParams,
  GetSubscriptionStatusParams,
  FetchSubscriptionsParams,
  TiersResponse,
  SubscriptionsResponse,
  SubscriptionStatusResponse,
  FollowResponse,
  PaidActionResponse,
} from "../types/subscriptionTypes";

const SUBSCRIPTION_DURATION_DAYS = 30;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Lazy cleanup: delete any paid subscriptions of this user that have expired.
 * Paid records past their expiresAt are simply removed. Follow records are
 * independent and untouched.
 */
async function cleanupExpiredPaid(subscriberId: string): Promise<void> {
  await prisma.subscription.deleteMany({
    where: {
      subscriberId,
      kind: "paid",
      expiresAt: { lte: new Date() },
    },
  });
}

/**
 * Same cleanup but scoped to a particular author (for profile view).
 */
async function cleanupExpiredPaidForAuthor(
  subscriberId: string,
  authorId: string,
): Promise<void> {
  await prisma.subscription.deleteMany({
    where: {
      subscriberId,
      authorId,
      kind: "paid",
      expiresAt: { lte: new Date() },
    },
  });
}

// ============================================================================
// TIERS (owner-only management)
// ============================================================================

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
            where: {
              kind: "paid",
              status: "active",
              expiresAt: { gt: new Date() },
            },
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
            where: {
              kind: "paid",
              status: "active",
              expiresAt: { gt: new Date() },
            },
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

  // Delete paid subscriptions tied to this tier. Follow records are untouched.
  await prisma.subscription.deleteMany({
    where: { tierId, kind: "paid" },
  });

  if (tier.imageUrl) {
    await deleteFile(tier.imageUrl);
  }

  await prisma.subscriptionTier.delete({ where: { id: tierId } });
};

// ============================================================================
// FOLLOW (free)
// ============================================================================

export const followAuthorService = async ({
  username,
  authUserId,
}: FollowAuthorParams): Promise<FollowResponse> => {
  if (!authUserId) throw new UnauthorizedError();

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");
  if (author.id === authUserId) {
    throw new BadRequestError("Cannot follow yourself");
  }

  await prisma.subscription.upsert({
    where: {
      subscriberId_authorId_kind: {
        subscriberId: authUserId,
        authorId: author.id,
        kind: "follow",
      },
    },
    create: {
      subscriberId: authUserId,
      authorId: author.id,
      kind: "follow",
      status: "active",
      tierId: null,
    },
    update: {
      status: "active",
      cancelledAt: null,
    },
  });

  return { follow: { active: true } };
};

export const unfollowAuthorService = async ({
  username,
  authUserId,
}: UnfollowAuthorParams): Promise<FollowResponse> => {
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
      kind: "follow",
    },
  });

  return { follow: { active: false } };
};

// ============================================================================
// PAID SUBSCRIPTION
// ============================================================================

export const subscribeToTierService = async ({
  username,
  authUserId,
  tierId,
}: SubscribeToTierParams): Promise<PaidActionResponse> => {
  if (!authUserId) throw new UnauthorizedError();
  if (!tierId) throw new BadRequestError("tierId is required");

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  if (author.id === authUserId) {
    throw new BadRequestError("Cannot subscribe to yourself");
  }

  const tier = await prisma.subscriptionTier.findUnique({
    where: { id: tierId },
    select: { authorId: true, isActive: true, priceCents: true },
  });

  if (!tier || tier.authorId !== author.id) {
    throw new BadRequestError("Invalid tier");
  }
  if (!tier.isActive) {
    throw new BadRequestError("This tier is no longer available");
  }

  // Clean up any expired paid record for this pair first
  await cleanupExpiredPaidForAuthor(authUserId, author.id);

  const now = new Date();
  const expiresAt = addDays(now, SUBSCRIPTION_DURATION_DAYS);

  // Auto-create follow record (Boosty: paying also means following)
  await prisma.subscription.upsert({
    where: {
      subscriberId_authorId_kind: {
        subscriberId: authUserId,
        authorId: author.id,
        kind: "follow",
      },
    },
    create: {
      subscriberId: authUserId,
      authorId: author.id,
      kind: "follow",
      status: "active",
      tierId: null,
    },
    update: {
      status: "active",
      cancelledAt: null,
    },
  });

  // Look at existing paid record to decide: first purchase, resubscribe,
  // upgrade, or downgrade.
  const existingPaid = await prisma.subscription.findUnique({
    where: {
      subscriberId_authorId_kind: {
        subscriberId: authUserId,
        authorId: author.id,
        kind: "paid",
      },
    },
    include: { tier: { select: { priceCents: true } } },
  });

  const hasActiveAccess =
    !!existingPaid && !!existingPaid.expiresAt && now < existingPaid.expiresAt;

  let paid;
  let paymentToCreate: { gross: number; kind: string } | null = null;

  if (!hasActiveAccess) {
    // First purchase, or previous period fully expired.
    // Full price, fresh 30-day period.
    paid = await prisma.subscription.upsert({
      where: {
        subscriberId_authorId_kind: {
          subscriberId: authUserId,
          authorId: author.id,
          kind: "paid",
        },
      },
      create: {
        subscriberId: authUserId,
        authorId: author.id,
        kind: "paid",
        tierId,
        status: "active",
        startDate: now,
        expiresAt,
        cancelledAt: null,
      },
      update: {
        tierId,
        status: "active",
        startDate: now,
        expiresAt,
        cancelledAt: null,
      },
    });
    paymentToCreate = {
      gross: tier.priceCents ?? 0,
      kind: "subscription",
    };
  } else if (existingPaid!.tierId === tierId) {
    // Same tier, still within paid period — this is a resubscribe after a
    // soft cancel. Reactivate, no payment, keep expiresAt.
    paid = await prisma.subscription.update({
      where: { id: existingPaid!.id },
      data: {
        status: "active",
        cancelledAt: null,
      },
    });
  } else {
    // Different tier, still within paid period — upgrade or downgrade.
    const oldPrice = existingPaid!.tier?.priceCents ?? 0;
    const newPrice = tier.priceCents ?? 0;
    const totalDays = SUBSCRIPTION_DURATION_DAYS;
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.max(
      Math.ceil(
        (existingPaid!.expiresAt!.getTime() - now.getTime()) / msPerDay,
      ),
      0,
    );

    if (newPrice > oldPrice) {
      // Upgrade: charge prorated difference for the remaining period.
      const unusedCreditCents = Math.floor((oldPrice * daysLeft) / totalDays);
      const newCostCents = Math.floor((newPrice * daysLeft) / totalDays);
      const diffCents = Math.max(newCostCents - unusedCreditCents, 0);

      paid = await prisma.subscription.update({
        where: { id: existingPaid!.id },
        data: {
          tierId,
          status: "active",
          cancelledAt: null,
          // expiresAt intentionally not touched
        },
      });

      if (diffCents > 0) {
        paymentToCreate = { gross: diffCents, kind: "upgrade" };
      }
    } else {
      // Downgrade: just swap the tier, no new payment, no refund.
      // expiresAt stays the same.
      paid = await prisma.subscription.update({
        where: { id: existingPaid!.id },
        data: {
          tierId,
          status: "active",
          cancelledAt: null,
        },
      });
    }
  }

  if (paymentToCreate) {
    await prisma.payment.create({
      data: {
        authorId: author.id,
        subscriberId: authUserId,
        tierId,
        grossCents: paymentToCreate.gross,
        kind: paymentToCreate.kind,
      },
    });
  }

  return {
    paid: {
      tierId,
      status: paid.status,
      hasAccess: true,
      expiresAt: paid.expiresAt?.toISOString() ?? null,
    },
  };
};

export const cancelPaidSubscriptionService = async ({
  username,
  authUserId,
}: CancelPaidSubscriptionParams): Promise<PaidActionResponse> => {
  if (!authUserId) throw new UnauthorizedError();

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  const paid = await prisma.subscription.findUnique({
    where: {
      subscriberId_authorId_kind: {
        subscriberId: authUserId,
        authorId: author.id,
        kind: "paid",
      },
    },
  });

  if (!paid) {
    return { paid: null };
  }

  const now = new Date();

  // If already expired — just delete
  if (paid.expiresAt && now >= paid.expiresAt) {
    await prisma.subscription.delete({ where: { id: paid.id } });
    return { paid: null };
  }

  // Soft cancel — access preserved until expiresAt
  const updated = await prisma.subscription.update({
    where: { id: paid.id },
    data: {
      status: "cancelled",
      cancelledAt: now,
    },
  });

  return {
    paid: {
      tierId: updated.tierId as string,
      status: updated.status,
      hasAccess: true,
      expiresAt: updated.expiresAt?.toISOString() ?? null,
    },
  };
};

// ============================================================================
// STATUS
// ============================================================================

export const getSubscriptionStatusService = async ({
  username,
  authUserId,
}: GetSubscriptionStatusParams): Promise<SubscriptionStatusResponse> => {
  const empty: SubscriptionStatusResponse = {
    follow: { active: false },
    paid: null,
  };

  if (!authUserId) return empty;

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!author) throw new NotFoundError("User not found");

  // Lazy cleanup of expired paid subs for this pair
  await cleanupExpiredPaidForAuthor(authUserId, author.id);

  const records = await prisma.subscription.findMany({
    where: {
      subscriberId: authUserId,
      authorId: author.id,
    },
    include: {
      tier: { select: { id: true, title: true, priceCents: true } },
    },
  });

  const followRec = records.find((r) => r.kind === "follow");
  const paidRec = records.find((r) => r.kind === "paid");

  const now = new Date();
  let paid: SubscriptionStatusResponse["paid"] = null;

  if (paidRec && paidRec.tierId) {
    const hasAccess =
      (paidRec.status === "active" ||
        (paidRec.status === "cancelled" &&
          !!paidRec.expiresAt &&
          now < paidRec.expiresAt)) &&
      (!paidRec.expiresAt || now < paidRec.expiresAt);

    paid = {
      tierId: paidRec.tierId,
      tierTitle: paidRec.tier?.title ?? null,
      tierPriceCents: paidRec.tier?.priceCents ?? null,
      status: paidRec.status,
      hasAccess,
      expiresAt: paidRec.expiresAt?.toISOString() ?? null,
    };
  }

  return {
    follow: { active: !!followRec && followRec.status === "active" },
    paid,
  };
};

// ============================================================================
// LIST SUBSCRIPTIONS (for /subscriptions page)
// ============================================================================

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

  // Lazy cleanup of expired paid subs for this user
  await cleanupExpiredPaid(user.id);

  const records = await prisma.subscription.findMany({
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

  // Group by author
  const byAuthor = new Map<
    string,
    {
      author: (typeof records)[number]["author"];
      follow: (typeof records)[number] | null;
      paid: (typeof records)[number] | null;
    }
  >();

  for (const r of records) {
    const entry = byAuthor.get(r.authorId) ?? {
      author: r.author,
      follow: null,
      paid: null,
    };
    if (r.kind === "follow") entry.follow = r;
    else if (r.kind === "paid") entry.paid = r;
    byAuthor.set(r.authorId, entry);
  }

  const now = new Date();

  const items: SubscribedAuthorDto[] = Array.from(byAuthor.values()).map(
    ({ author, follow, paid }) => {
      const paidBlock = paid
        ? {
            tierId: paid.tierId as string,
            tierTitle: paid.tier?.title ?? null,
            tierPriceCents: paid.tier?.priceCents ?? null,
            status: paid.status,
            hasAccess:
              (paid.status === "active" ||
                (paid.status === "cancelled" &&
                  !!paid.expiresAt &&
                  now < paid.expiresAt)) &&
              (!paid.expiresAt || now < paid.expiresAt),
            startDate: paid.startDate.toISOString(),
            expiresAt: paid.expiresAt?.toISOString() ?? null,
            cancelledAt: paid.cancelledAt?.toISOString() ?? null,
          }
        : null;

      return {
        id: author.id,
        username: author.username,
        avatarUrl: author.avatarUrl ?? null,
        bannerUrl: author.bannerUrl ?? null,
        description: author.description ?? null,
        follow: {
          active: !!follow && follow.status === "active",
          startDate: follow?.startDate.toISOString() ?? null,
        },
        paid: paidBlock,
      };
    },
  );

  return { items };
};
