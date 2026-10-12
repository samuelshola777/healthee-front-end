"use client";
import { useEffect } from "react";

// Section entrances are independent of the hero's automatic animation clock.
export default function ScrollEffects() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    function setup() {
      observer?.disconnect();
      const elements = document.querySelectorAll(".reveal");
      if (preference.matches || !("IntersectionObserver" in window)) {
        document.documentElement.classList.remove("js-motion");
        elements.forEach((element) => element.classList.add("visible"));
        return;
      }
      document.documentElement.classList.add("js-motion");
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08 },
      );
      elements.forEach((element) => observer?.observe(element));
    }
    preference.addEventListener("change", setup);
    setup();
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", setup);
      document.documentElement.classList.remove("js-motion");
    };
  }, []);
  return null;
}
