import Modal from "@shared/ui/modal/Modal";
import { Suspense } from "react";
import Loader from "@shared/ui/loader/Loader";

import type { SubscriptionTier } from "../model/types/types";
import { EditTierForm } from "./editForm/EditTierForm";

interface EditTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  tier: SubscriptionTier;
  onUpdated: () => void;
}

export const EditTierModal = (props: EditTierModalProps) => {
  const { isOpen, onClose, username, tier, onUpdated } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Suspense fallback={<Loader />}>
        <EditTierForm
          username={username}
          tier={tier}
          onUpdated={onUpdated}
          onCancel={onClose}
        />
      </Suspense>
    </Modal>
  );
};
