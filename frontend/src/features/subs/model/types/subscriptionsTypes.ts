export type Subscriptions = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  description?: string | null;
  tierId?: string | null;
  tierTitle?: string | null;
  tierPriceCents?: number | null;
  status: string;
  startDate: string;
  expiresAt?: string | null;
  cancelledAt?: string | null;
};
