export interface UserProfileDto {
  id: string;
  username: string;
  createdAt: Date;
  avatarUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
}

export interface SearchResultDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  description: string | null;
  createdAt: Date;
}

export interface UpdateProfileInput {
  username: string;
  authUserId: string;
  description?: string | null;
}

export interface UpdateAvatarInput {
  username: string;
  authUserId: string;
  fileBuffer: Buffer;
}

export interface UpdateBannerInput {
  username: string;
  authUserId: string;
  fileBuffer: Buffer;
}

export interface SearchUsersInput {
  query: string;
}

export interface UpdatedUserImageResponse {
  id: string;
  username: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

export interface SearchUsersResponse {
  items: SearchResultDto[];
}