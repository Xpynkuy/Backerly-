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
  tierId?: string | null;
  tierTitle?: string | null;
  tierPriceCents?: number | null;
  status: string;
  startDate: string;
  expiresAt?: string | null;
  cancelledAt?: string | null;
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

export interface SubscribeParams {
  username: string;
  authUserId: string;
  tierId?: string | null;
}

export interface UnsubscribeParams {
  username: string;
  authUserId: string;
  tierId?: string | null;
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
  subscribed: boolean;
  tierId: string | null;
  tierTitle: string | null;
  tierPriceCents: number | null;
  status: string | null;
  expiresAt: string | null;
}

export interface SubscribeResponse {
  subscribed: boolean;
  status: string;
  expiresAt: string | null;
}
