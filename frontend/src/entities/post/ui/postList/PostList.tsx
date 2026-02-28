import type { ReactNode } from "react";
import type { Post } from "../../model/types/postTypes";
import styles from "./PostList.module.scss";

interface PostListProps {
  posts: Post[];
  renderItem: (post: Post) => ReactNode;
}
export const PostList = (props: PostListProps) => {
  const { posts, renderItem } = props;
  return (
    <div className={styles.listContainer}>
      {posts.map(renderItem)}
    </div>
  );
};
