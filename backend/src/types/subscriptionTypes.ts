export interface TierDto {
  id: string;
  authorId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents?: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriberCount?: number;
}

export interface SubscribedAuthorDto {
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
}

export interface FetchTiersByUsernameParams {
  username: string;
}

export interface CreateTierParams {
  username: string;
  authUserId: string;
  title: string;
  description?: string | null;
  priceCents?: number | null;
  sortOrder?: number | null;
  fileBuffer?: Buffer | null;
}

export interface UpdateTierParams {
  username: string;
  tierId: string;
  authUserId: string;
  title?: string | null;
  description?: string | null;
  priceCents?: number | null;
  sortOrder?: number | null;
  fileBuffer?: Buffer | null;
}

export interface DeleteTierParams {
  username: string;
  tierId: string;
  authUserId: string;
}

export interface FollowAuthorParams {
  username: string;
  authUserId: string;
}

export interface UnfollowAuthorParams {
  username: string;
  authUserId: string;
}

export interface SubscribeToTierParams {
  username: string;
  authUserId: string;
  tierId: string;
  durationMonths: number;
}

export interface CancelPaidSubscriptionParams {
  username: string;
  authUserId: string;
}

export interface GetSubscriptionStatusParams {
  username: string;
  authUserId?: string | null;
}

export interface FetchSubscriptionsParams {
  username: string;
  authUserId: string;
}

export interface TiersResponse {
  items: TierDto[];
}

export interface SubscriptionsResponse {
  items: SubscribedAuthorDto[];
}

export interface SubscriptionStatusResponse {
  follow: {
    active: boolean;
  };
  paid: {
    tierId: string;
    tierTitle: string | null;
    tierPriceCents: number | null;
    status: string;
    hasAccess: boolean;
    durationMonths: number;
    expiresAt: string | null;
    scheduledTierId: string | null;
    scheduledTierTitle: string | null;
  } | null;
}

export interface FollowResponse {
  follow: { active: boolean };
}

export interface PaidActionResponse {
  paid: {
    tierId: string;
    status: string;
    hasAccess: boolean;
    durationMonths: number;
    expiresAt: string | null;
    scheduledTierId: string | null;
  } | null;
}
