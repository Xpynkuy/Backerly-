import type { FC, MouseEvent, ReactNode } from "react";
import styles from "./Modal.module.scss";
import Portal from "../portal/Portal";
import { X } from "lucide-react";

interface ModalProps {
  children?: ReactNode;
  isOpen?: boolean;
  onClose: () => void;
}

const Modal: FC<ModalProps> = ({ children, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const handleClickOverlay = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal>
      <div className={styles.modal}>
        <div className={styles.overlay} onClick={handleClickOverlay}>
          <div className={styles.content}>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={28} />
            </button>
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
