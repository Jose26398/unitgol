import type React from "react";
import { Dialog } from "./Dialog";

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  errorMessage?: string;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  title = "¿Eliminar?",
  message = "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  errorMessage,
  isConfirming = false,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <Dialog title={title} onClose={onCancel} busy={isConfirming}>
      <p className="mb-6">{message}</p>
      {errorMessage && (
        <p className="text-red-600 text-sm mb-4" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400"
          onClick={onCancel}
          disabled={isConfirming}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700"
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? "Procesando..." : confirmText}
        </button>
      </div>
    </Dialog>
  );
};
