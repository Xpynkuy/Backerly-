import { useDeletePostMutation } from "@entities/post/model/api/postApi";
import MyButton from "@shared/ui/button/MyButton";
import { Trash2 } from "lucide-react";

interface PostDeleteButtonProps {
  username: string;
  postId: string;
}

export const PostDeleteButton = (props: PostDeleteButtonProps) => {
  const { username, postId } = props;
  const [deletePost, { isLoading }] = useDeletePostMutation();

  const onDelete = () => deletePost({ postId, username });

  return (
    <MyButton
      onClick={onDelete}
      disabled={isLoading}
      color="TRANSPARENT"
      size="AUTO"
    >
      <Trash2 size={22} />
    </MyButton>
  );
};
