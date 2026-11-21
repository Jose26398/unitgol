import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export function Dialog({
  title,
  onClose,
  busy = false,
  children,
}: {
  title: string;
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-modal="true"
      className="ui-enter ui-surface m-auto w-full max-w-2xl max-h-[90vh] rounded-lg bg-white p-6 shadow-xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-xs"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2 id={titleId} className="text-xl font-semibold mb-4">
        {title}
      </h2>
      {children}
    </dialog>,
    document.body,
  );
}
