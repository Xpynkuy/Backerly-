export interface PostDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
  isPaid: boolean;
  accessTierId: string | null;
  accessTier?: {
    id: string;
    title: string;
  } | null;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  liked: boolean;
  locked: boolean;
}

export interface CommentDto {
  id: string;
  text: string;
  createdAt: Date;
  author: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface CreatePostParams {
  username: string;
  authUserId: string;
  title: string;
  description: string;
  isPaid: boolean;
  accessTierId?: string | null;
  fileBuffer?: Buffer | null;
}

export interface FetchPostsParams {
  username: string;
  take: number;
  cursor?: string;
  authUserId?: string | null;
}

export interface DeletePostParams {
  postId: string;
  authUserId: string;
}

export interface ToggleLikeParams {
  postId: string;
  authUserId: string;
}

export interface AddCommentParams {
  postId: string;
  authUserId: string;
  text: string;
}

export interface GetCommentsParams {
  postId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ToggleLikeResult {
  liked: boolean;
  likesCount: number;
}

export interface AddCommentResult {
  comment: CommentDto;
  commentsCount: number;
}

export interface CommentsResponse {
  items: CommentDto[];
}