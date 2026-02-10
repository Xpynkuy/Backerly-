import Loader from "@shared/ui/loader/Loader";
import Modal from "@shared/ui/modal/Modal";
import { Suspense } from "react";
import { CreatePostForm } from "../createPostForm/CreatePostForm";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onCreated?: () => void;
}

export const CreatePostModal = (props: CreatePostModalProps) => {
  const { isOpen, onClose, username, onCreated } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Suspense fallback={<Loader />}>
        <CreatePostForm
          username={username}
          onCreated={() => {
            onCreated?.();
          }}
        />
      </Suspense>
    </Modal>
  );
};
