export type SubscriptionTier = {
  id: string;
  authorId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents?: number | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type SubscriptionStatus = {
  subscribed: boolean;
  tier?: SubscriptionTier | null;
};

export type SubscriptionUser = {
  id: string;
  username: string;
  avatarUrl?: string | null;
};

