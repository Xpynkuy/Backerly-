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

const DAYS_PER_MONTH = 30;
const ALLOWED_DURATIONS = [1, 3];

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + DAYS_PER_MONTH * months);
  return result;
}

async function cleanupExpiredPaid(subscriberId: string): Promise<void> {
  await prisma.subscription.deleteMany({
    where: {
      subscriberId,
      kind: "paid",
      expiresAt: { lte: new Date() },
    },
  });
}

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

  // Guard: price must be unique among this author's active tiers.
  // The access-control logic compares tiers by priceCents, so two tiers with
  // the same price would be ambiguous for upgrade/downgrade decisions.
  if (priceCents !== undefined && priceCents !== null) {
    const duplicate = await prisma.subscriptionTier.findFirst({
      where: {
        authorId: author.id,
        isActive: true,
        priceCents: Number(priceCents),
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new BadRequestError("TIER_PRICE_DUPLICATE");
    }
  }

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

  // priceCents is intentionally NOT updated — pricing is fixed at tier creation
  // to keep existing subscribers' billing and access checks consistent.
  const updated = await prisma.subscriptionTier.update({
    where: { id: tierId },
    data: {
      title: title?.trim() ?? tier.title,
      description: description !== undefined ? description : tier.description,
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

  const now = new Date();

  // Guard: can't delete a tier that has active paying subscribers.
  // Active = paid sub with access-granting status AND not-yet-expired.
  const activeCount = await prisma.subscription.count({
    where: {
      tierId,
      kind: "paid",
      status: { in: ["active", "cancelled"] },
      expiresAt: { gt: now },
    },
  });

  if (activeCount > 0) {
    throw new BadRequestError("TIER_HAS_ACTIVE_SUBSCRIBERS");
  }

  // No active subscribers — safe to delete.
  // Clean up any paid records pointing to this tier (all are expired).
  await prisma.subscription.deleteMany({
    where: { tierId, kind: "paid" },
  });

  // Clear scheduled downgrades targeting this tier
  await prisma.subscription.updateMany({
    where: { scheduledTierId: tierId },
    data: { scheduledTierId: null },
  });

  // Posts that used this tier become free
  await prisma.post.updateMany({
    where: { accessTierId: tierId },
    data: { isPaid: false, accessTierId: null },
  });

  if (tier.imageUrl) {
    try {
      await deleteFile(tier.imageUrl);
    } catch (e) {
      console.error("Failed to delete tier image", e);
    }
  }

  await prisma.subscriptionTier.delete({ where: { id: tierId } });
};

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

export const subscribeToTierService = async ({
  username,
  authUserId,
  tierId,
  durationMonths,
}: SubscribeToTierParams): Promise<PaidActionResponse> => {
  if (!authUserId) throw new UnauthorizedError();
  if (!tierId) throw new BadRequestError("tierId is required");

  if (!ALLOWED_DURATIONS.includes(durationMonths)) {
    throw new BadRequestError("durationMonths must be 1 or 3");
  }

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

  await cleanupExpiredPaidForAuthor(authUserId, author.id);

  const now = new Date();

  // Ensure follow exists (paid implies follow)
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

  // ============================================================
  // CASE 1: First purchase (or previous fully expired)
  // ============================================================
  if (!hasActiveAccess) {
    const expiresAt = addMonths(now, durationMonths);

    const paid = await prisma.subscription.upsert({
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
        scheduledTierId: null,
        status: "active",
        durationMonths,
        startDate: now,
        expiresAt,
        cancelledAt: null,
      },
      update: {
        tierId,
        scheduledTierId: null,
        status: "active",
        durationMonths,
        startDate: now,
        expiresAt,
        cancelledAt: null,
      },
    });

    await prisma.payment.create({
      data: {
        authorId: author.id,
        subscriberId: authUserId,
        tierId,
        grossCents: (tier.priceCents ?? 0) * durationMonths,
        kind: "subscription",
      },
    });

    return {
      paid: {
        tierId,
        status: paid.status,
        hasAccess: true,
        durationMonths: paid.durationMonths,
        expiresAt: paid.expiresAt?.toISOString() ?? null,
        scheduledTierId: null,
      },
    };
  }

  // From here: hasActiveAccess === true
  const currentTierId = existingPaid!.tierId;
  const oldPrice = existingPaid!.tier?.priceCents ?? 0;
  const newPrice = tier.priceCents ?? 0;

  // ============================================================
  // CASE 2: Same tier
  // ============================================================
  if (currentTierId === tierId) {
    // 2a. Cancelled but still has access — pure reactivation, no payment, no extension.
    //     Just clear cancelled flag and any scheduled change.
    if (existingPaid!.status === "cancelled") {
      const paid = await prisma.subscription.update({
        where: { id: existingPaid!.id },
        data: {
          status: "active",
          cancelledAt: null,
          scheduledTierId: null,
        },
      });

      return {
        paid: {
          tierId,
          status: paid.status,
          hasAccess: true,
          durationMonths: paid.durationMonths,
          expiresAt: paid.expiresAt?.toISOString() ?? null,
          scheduledTierId: null,
        },
      };
    }

    // 2b. Active renewal — pay for + extend by `durationMonths`.
    //     Accumulate durationMonths so the prorate formula stays correct
    //     for any future upgrade (totalDays = 30 * durationMonths matches
    //     the real start..expiresAt window).
    const newExpiresAt = addMonths(existingPaid!.expiresAt!, durationMonths);
    const newTotalMonths = (existingPaid!.durationMonths ?? 1) + durationMonths;

    const paid = await prisma.subscription.update({
      where: { id: existingPaid!.id },
      data: {
        status: "active",
        cancelledAt: null,
        scheduledTierId: null,
        durationMonths: newTotalMonths,
        expiresAt: newExpiresAt,
      },
    });

    await prisma.payment.create({
      data: {
        authorId: author.id,
        subscriberId: authUserId,
        tierId,
        grossCents: newPrice * durationMonths,
        kind: "renewal",
      },
    });

    return {
      paid: {
        tierId,
        status: paid.status,
        hasAccess: true,
        durationMonths: paid.durationMonths,
        expiresAt: paid.expiresAt?.toISOString() ?? null,
        scheduledTierId: null,
      },
    };
  }

  // ============================================================
  // CASE 3: Upgrade — immediate, prorated diff against full period cost
  // ============================================================
  if (newPrice > oldPrice) {
    const months = existingPaid!.durationMonths ?? 1;
    const totalDays = DAYS_PER_MONTH * months;
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.max(
      Math.ceil(
        (existingPaid!.expiresAt!.getTime() - now.getTime()) / msPerDay,
      ),
      0,
    );

    // Prorate against the FULL price of the period (price * months),
    // not the monthly price. Otherwise the diff is under-charged by
    // a factor of `months`.
    const oldFullCost = oldPrice * months;
    const newFullCost = newPrice * months;
    const unusedCreditCents = Math.floor((oldFullCost * daysLeft) / totalDays);
    const newCostCents = Math.floor((newFullCost * daysLeft) / totalDays);
    const diffCents = Math.max(newCostCents - unusedCreditCents, 0);

    const paid = await prisma.subscription.update({
      where: { id: existingPaid!.id },
      data: {
        tierId,
        scheduledTierId: null,
        status: "active",
        cancelledAt: null,
        // expiresAt, durationMonths — unchanged
      },
    });

    if (diffCents > 0) {
      await prisma.payment.create({
        data: {
          authorId: author.id,
          subscriberId: authUserId,
          tierId,
          grossCents: diffCents,
          kind: "upgrade",
        },
      });
    }

    return {
      paid: {
        tierId,
        status: paid.status,
        hasAccess: true,
        durationMonths: paid.durationMonths,
        expiresAt: paid.expiresAt?.toISOString() ?? null,
        scheduledTierId: null,
      },
    };
  }

  // ============================================================
  // CASE 4: Downgrade — schedule, no immediate change
  // ============================================================
  // Boosty-style: current tier keeps running until expiresAt, new tier takes
  // effect only when the user renews (manually, in this implementation).
  // No refund, no immediate tier change.

  // Edge case: user "downgraded" to a tier they don't currently have but the
  // request happens to match an existing scheduled change. Just (re)set it.
  // Also covers the case where currentTierId is somehow null — treat as set.
  const paid = await prisma.subscription.update({
    where: { id: existingPaid!.id },
    data: {
      scheduledTierId: tierId,
      // tierId, expiresAt, durationMonths, status — unchanged
    },
  });

  return {
    paid: {
      tierId: paid.tierId as string, // still the old tier
      status: paid.status,
      hasAccess: true,
      durationMonths: paid.durationMonths,
      expiresAt: paid.expiresAt?.toISOString() ?? null,
      scheduledTierId: paid.scheduledTierId,
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

  if (!paid) return { paid: null };

  const now = new Date();

  if (paid.expiresAt && now >= paid.expiresAt) {
    await prisma.subscription.delete({ where: { id: paid.id } });
    return { paid: null };
  }

  const updated = await prisma.subscription.update({
    where: { id: paid.id },
    data: {
      status: "cancelled",
      cancelledAt: now,
      scheduledTierId: null,
    },
  });

  return {
    paid: {
      tierId: updated.tierId as string,
      status: updated.status,
      hasAccess: true,
      durationMonths: updated.durationMonths ?? 1,
      expiresAt: updated.expiresAt?.toISOString() ?? null,
      scheduledTierId: null,
    },
  };
};

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

  await cleanupExpiredPaidForAuthor(authUserId, author.id);

  const records = await prisma.subscription.findMany({
    where: { subscriberId: authUserId, authorId: author.id },
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

    let scheduledTierTitle: string | null = null;
    if (paidRec.scheduledTierId) {
      const schedTier = await prisma.subscriptionTier.findUnique({
        where: { id: paidRec.scheduledTierId },
        select: { title: true },
      });
      scheduledTierTitle = schedTier?.title ?? null;
    }

    paid = {
      tierId: paidRec.tierId,
      tierTitle: paidRec.tier?.title ?? null,
      tierPriceCents: paidRec.tier?.priceCents ?? null,
      status: paidRec.status,
      hasAccess,
      durationMonths: paidRec.durationMonths ?? 1,
      expiresAt: paidRec.expiresAt?.toISOString() ?? null,
      scheduledTierId: paidRec.scheduledTierId ?? null,
      scheduledTierTitle,
    };
  }

  return {
    follow: { active: !!followRec && followRec.status === "active" },
    paid,
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
      tier: { select: { id: true, title: true, priceCents: true } },
    },
  });

  // Preload scheduled tier titles in one query
  const scheduledIds = records
    .filter((r) => r.kind === "paid" && r.scheduledTierId)
    .map((r) => r.scheduledTierId!) as string[];

  const scheduledTiers = scheduledIds.length
    ? await prisma.subscriptionTier.findMany({
        where: { id: { in: scheduledIds } },
        select: { id: true, title: true },
      })
    : [];
  const scheduledTitleById = new Map<string, string>(
    scheduledTiers.map((t) => [t.id, t.title]),
  );

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
            durationMonths: paid.durationMonths ?? 1,
            startDate: paid.startDate.toISOString(),
            expiresAt: paid.expiresAt?.toISOString() ?? null,
            cancelledAt: paid.cancelledAt?.toISOString() ?? null,
            scheduledTierId: paid.scheduledTierId ?? null,
            scheduledTierTitle: paid.scheduledTierId
              ? (scheduledTitleById.get(paid.scheduledTierId) ?? null)
              : null,
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
