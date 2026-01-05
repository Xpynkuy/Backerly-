export interface User {
  id: string;
  username: string;
  createdAt?: string;

  avatarUrl?: string | null;
  bannerUrl?: string | null;
}
