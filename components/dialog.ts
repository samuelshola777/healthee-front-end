"use client";
import { useEffect, type MouseEvent, type RefObject } from "react";

export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
  const dialog = event.currentTarget;
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.close();
}

// Native dialogs handle focus trapping, Escape and focus restoration.
export function useDialogScrollLock(ref: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const update = () =>
      document.body.classList.toggle(
        "modal-open",
        Boolean(document.querySelector("dialog[open]")),
      );
    const observer = new MutationObserver(update);
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    dialog.addEventListener("close", update);
    return () => {
      observer.disconnect();
      dialog.removeEventListener("close", update);
      if (dialog.open) dialog.close();
      update();
    };
  }, [ref]);
}
