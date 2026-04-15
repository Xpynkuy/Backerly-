export interface User {
  id: string;
  username: string;
  createdAt?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  isCreator?: boolean;
  creatorActivatedAt?: string | null;
  paidSubscriberCount?: number;
  totalSubscriberCount?: number;
}