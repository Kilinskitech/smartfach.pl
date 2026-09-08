"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({
  title,
  description,
  children,
  onClose,
  busy = false,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current;
    const trigger = document.activeElement;
    element?.showModal();
    if (element) element.scrollTop = 0;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"panel-dialog" + (wide ? " panel-wide" : "")}
      aria-labelledby="panel-title"
      aria-describedby={description ? "panel-description" : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          if (!busy) onClose();
        }
      }}
    >
      <header className="panel-header">
        <div>
          <p className="eyebrow">SMARTFACH · TWOJA PRACA</p>
          <h2 id="panel-title">{title}</h2>
        </div>
        <button
          type="button"
          className="close-button"
          disabled={busy}
          onClick={onClose}
          aria-label="Zamknij bez zmian"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      {description && (
        <p id="panel-description" className="panel-description">
          {description}
        </p>
      )}
      {children}
    </dialog>
  );
}
