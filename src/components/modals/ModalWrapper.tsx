import React, { type ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropClassName?: string;
  modalClassName?: string;
}

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  backdropClassName = "",
  modalClassName = "",
}: ModalWrapperProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-modal bg-black/5 flex items-center justify-center p-base backdrop-blur-xs ${backdropClassName}`}
          onClick={handleBackdropClick}>
          <motion.div
            initial={{ y: 0, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 0, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
            className={`flow relative  bg-global-background max-w-modal-width border border-global-text w-full p-base ${modalClassName}`}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof window !== "undefined" ? ReactDOM.createPortal(modal, document.body) : null;
}
