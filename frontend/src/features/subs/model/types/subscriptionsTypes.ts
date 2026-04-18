export type Subscriptions = {
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
