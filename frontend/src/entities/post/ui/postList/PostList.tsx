import type { ReactNode } from "react";
import type { Post } from "../../model/types/postTypes";

export const PostList = ({
  posts,
  renderItem,
}: {
  posts: Post[];
  renderItem: (post: Post) => ReactNode;
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {posts.map(renderItem)}
    </div>
  );
};
