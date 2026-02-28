export type Comment = {
    id: string;
    text: string;
    createdAt: string;
    author: {
      username: string;
      avatarUrl?: string | null;
    };
};
