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

export type SubscriptionStatus = {
  subscribed: boolean;
  followed: boolean;
  tierId: string | null;
  tierTitle: string | null;
  tierPriceCents: number | null;
  status: string | null;
  expiresAt: string | null;
};

export type SubscriptionUser = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  tierId?: string | null;
  tierTitle?: string | null;
  tierPriceCents?: number | null;
  status: string;
  startDate: string;
  expiresAt?: string | null;
  cancelledAt?: string | null;
};
