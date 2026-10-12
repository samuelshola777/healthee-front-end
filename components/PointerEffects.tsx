"use client";

import { useEffect } from "react";

export default function PointerEffects() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let teardown = () => {};

    function setup() {
      teardown();
      if (!finePointer.matches || reducedMotion.matches) return;

      const cleanups: (() => void)[] = [];
      document
        .querySelectorAll<HTMLElement>(".feature-card")
        .forEach((element) => {
          let frame = 0;
          let x = 0;
          let y = 0;

          function move(event: PointerEvent) {
            if (event.pointerType !== "mouse") return;
            const bounds = element.getBoundingClientRect();
            x = Math.max(
              -1,
              Math.min(
                1,
                ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
              ),
            );
            y = Math.max(
              -1,
              Math.min(
                1,
                ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
              ),
            );
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
              element.style.setProperty("--pointer-x", String(x));
              element.style.setProperty("--pointer-y", String(y));
              frame = 0;
            });
          }

          function reset() {
            window.cancelAnimationFrame(frame);
            frame = 0;
            element.style.removeProperty("--pointer-x");
            element.style.removeProperty("--pointer-y");
          }

          element.addEventListener("pointermove", move, { passive: true });
          element.addEventListener("pointerleave", reset);
          cleanups.push(() => {
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", reset);
            reset();
          });
        });
      teardown = () => cleanups.forEach((cleanup) => cleanup());
    }

    finePointer.addEventListener("change", setup);
    reducedMotion.addEventListener("change", setup);
    setup();
    return () => {
      teardown();
      finePointer.removeEventListener("change", setup);
      reducedMotion.removeEventListener("change", setup);
    };
  }, []);

  return null;
}
