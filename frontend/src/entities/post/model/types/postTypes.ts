export type PostAuthor = {
  username: string;
  avatarUrl?: string | null;
};

export type Post = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string;

  author: PostAuthor;

  _count: {
    likes: number;
    comments: number;
  };
};

export type PostPage = {
  items: Post[];
  nextCursor: string | null;
};

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  author: PostAuthor;
};
