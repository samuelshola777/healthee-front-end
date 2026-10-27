"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { closeOnBackdrop, useDialogScrollLock } from "../dialog";
import styles from "./live-admin.module.css";

type AdminDialogProps = {
  title: string;
  children: ReactNode;
  busy?: boolean;
  onClose: () => void;
};

export default function AdminDialog({
  title,
  children,
  busy = false,
  onClose,
}: AdminDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useDialogScrollLock(dialog);

  useEffect(() => {
    const element = dialog.current;

    if (!element) return;

    if (!element.open) {
      element.showModal();
    }

    return () => {
      if (element.open) {
        element.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        if (busy) {
          event.preventDefault();
        }
      }}
      onClose={(event) => {
        // Ignore a queued cleanup event if Strict Mode reopened the dialog.
        if (!event.currentTarget.open) {
          onClose();
        }
      }}
      onClick={(event) => {
        if (!busy) {
          closeOnBackdrop(event);
        }
      }}
    >
      <header className={styles.dialogHeader}>
        <h2 id={titleId}>{title}</h2>

        <button
          type="button"
          disabled={busy}
          aria-label="Close editor"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
      </header>

      <div className={styles.dialogBody}>{children}</div>
    </dialog>
  );
}