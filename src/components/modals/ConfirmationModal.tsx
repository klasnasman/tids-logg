import { ModalWrapper } from "./ModalWrapper";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Radera kund",
  message = "Den här åtgärden går inte att ångra.",
}: ConfirmationModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} modalClassName="max-w-modal-width-sm">
        <div className="flex justify-start items-center w-full">
          <p>{title}</p>
        </div>
        <p className="text-pretty">{message}</p>
        <div className="repel mt-lg">
          <button className="button" data-variant="white" onClick={onClose}>
            Avbryt
          </button>
          <button className="button" data-variant="danger" onClick={onConfirm}>
            Radera
          </button>
        </div>
    </ModalWrapper>
  );
}
