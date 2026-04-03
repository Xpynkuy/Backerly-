import Modal from "@shared/ui/modal/Modal";
import { Suspense } from "react";
import Loader from "@shared/ui/loader/Loader";
import { EditPostForm } from "./EditPostForm";
import type { Post } from "@entities/post/model/types/postTypes";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  post: Post;
  onUpdated: () => void;
}

export const EditPostModal = (props: EditPostModalProps) => {
  const { isOpen, onClose, username, post, onUpdated } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Suspense fallback={<Loader />}>
        <EditPostForm
          username={username}
          post={post}
          onUpdated={onUpdated}
          onCancel={onClose}
        />
      </Suspense>
    </Modal>
  );
};
