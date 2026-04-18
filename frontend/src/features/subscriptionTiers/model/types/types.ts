export type SubscriptionTier = {
  id: string;
  authorId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents?: number | null;
  sortOrder: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string | null;
  subscriberCount?: number;
};

export type PaidBlock = {
  tierId: string;
  tierTitle: string | null;
  tierPriceCents: number | null;
  status: string;
  hasAccess: boolean;
  durationMonths: number;
  expiresAt: string | null;
  scheduledTierId: string | null;
  scheduledTierTitle: string | null;
};

export type FollowBlock = {
  active: boolean;
};

export type SubscriptionStatus = {
  follow: FollowBlock;
  paid: PaidBlock | null;
};

export type SubscriptionUser = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  follow: {
    active: boolean;
    startDate: string | null;
  };
  paid: {
    tierId: string;
    tierTitle: string | null;
    tierPriceCents: number | null;
    status: string;
    hasAccess: boolean;
    durationMonths: number;
    startDate: string;
    expiresAt: string | null;
    cancelledAt: string | null;
    scheduledTierId: string | null;
    scheduledTierTitle: string | null;
  } | null;
};
