import Loader from "@shared/ui/loader/Loader";
import Modal from "@shared/ui/modal/Modal";
import { Suspense } from "react";
import { CreateTierForm } from "./createForm/CreateTierForm";


interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onCreated: () => void;
}

export const CreateTierModal = (props: CreatePostModalProps) => {
  const { isOpen, onClose, username, onCreated } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Suspense fallback={<Loader />}>
         <CreateTierForm
          username={username}
          onCreated={onCreated}
        />
      </Suspense>
    </Modal>
  );
};
