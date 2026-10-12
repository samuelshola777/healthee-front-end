"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.css";

const MOBILE_QUERY = "(max-width: 900px) and (orientation: portrait)";

export default function HeroVideo({
  onActivityChange,
}: {
  onActivityChange?: (active: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<
    "idle" | "blocked" | "unavailable" | "reduced" | "loading" | "ready"
  >("idle");
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !hostRef.current) return;
    const video = videoRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia(MOBILE_QUERY);
    let disposed = false,
      userPaused = false,
      inView = true,
      failed = false;
    let modalOpen = !!document.querySelector("dialog[open]"),
      source = "",
      generation = 0;
    let loadTimeout: number | undefined;
    const canPlay = () =>
      !disposed &&
      !failed &&
      !userPaused &&
      !motion.matches &&
      inView &&
      !document.hidden &&
      !modalOpen;

    function sync() {
      onActivityChange?.(canPlay() && video!.readyState >= 2);
      if (!canPlay()) {
        video.pause();
        return;
      }
      const attempt = generation;
      const playing = video.play();
      playing
        ?.then(() => {
          if (!canPlay()) video.pause();
        })
        .catch((error) => {
          // A pause or responsive source change may cancel an in-flight play().
          if (disposed || attempt !== generation || error.name === "AbortError")
            return;
          if (error.name === "NotAllowedError") {
            userPaused = true;
            setPaused(true);
            setStatus("blocked");
            onActivityChange?.(false);
          } else fail();
        });
    }
    function fail() {
      if (disposed) return;
      failed = true;
      onActivityChange?.(false);
      video.pause();
      clearTimeout(loadTimeout);
      setVisible(false);
      setStatus("unavailable");
    }
    function chooseSource() {
      if (motion.matches) {
        generation++;
        onActivityChange?.(false);
        video.pause();
        clearTimeout(loadTimeout);
        video.removeAttribute("src");
        video.load();
        source = "";
        setVisible(false);
        setStatus("reduced");
        return;
      }
      const next = `/assets/hero/hero-${mobile.matches ? "mobile" : "desktop"}.mp4`;
      if (next !== source) {
        generation++;
        onActivityChange?.(false);
        source = next;
        failed = false;
        video.pause();
        setVisible(false);
        setStatus("loading");
        clearTimeout(loadTimeout);
        video.src = source;
        video.load();
        loadTimeout = window.setTimeout(fail, 15000);
      }
      sync();
    }
    function loaded() {
      if (disposed || failed || motion.matches) return;
      clearTimeout(loadTimeout);
      setVisible(true);
      setStatus("ready");
      sync();
    }
    function dialogsChanged() {
      modalOpen = !!document.querySelector("dialog[open]");
      sync();
    }
    controllerRef.current = () => {
      userPaused = !userPaused;
      setPaused(userPaused);
      sync();
    };
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("error", fail);
    const observer = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    });
    observer.observe(hostRef.current);
    const dialogs = new MutationObserver(dialogsChanged);
    document
      .querySelectorAll("dialog")
      .forEach((dialog) =>
        dialogs.observe(dialog, {
          attributes: true,
          attributeFilter: ["open"],
        }),
      );
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", chooseSource);
    mobile.addEventListener("change", chooseSource);
    chooseSource();
    return () => {
      disposed = true;
      onActivityChange?.(false);
      generation++;
      clearTimeout(loadTimeout);
      observer.disconnect();
      dialogs.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", chooseSource);
      mobile.removeEventListener("change", chooseSource);
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("error", fail);
      video.pause();
      video.removeAttribute("src");
      video.load();
      controllerRef.current = null;
    };
  }, [onActivityChange]);

  const disabled =
    status === "loading" || status === "reduced" || status === "unavailable";
  const label =
    status === "reduced"
      ? "Motion reduced"
      : status === "unavailable"
        ? "Still image"
        : status === "loading"
          ? "Loading motion"
          : paused
            ? "Play animation"
            : "Pause animation";
  return (
    <>
      <div
        className={styles.media}
        ref={hostRef}
        data-testid="hero-media"
        aria-hidden="true"
      >
        <picture>
          <source
            media={MOBILE_QUERY}
            srcSet="/assets/hero/poster-mobile.webp"
          />
          <img
            src="/assets/hero/poster-desktop.webp"
            alt=""
            width="1600"
            height="900"
            fetchPriority="high"
          />
        </picture>
        <video
          ref={videoRef}
          className={visible ? styles.videoVisible : ""}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          disablePictureInPicture
        />
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.motionControl}>
        {status !== "idle" && (
          <button
            type="button"
            onClick={() => controllerRef.current?.()}
            disabled={disabled}
            aria-pressed={paused}
            aria-label={label}
          >
            <span aria-hidden="true">
              {disabled ? "○" : paused ? "▷" : "Ⅱ"}
            </span>
            {label}
          </button>
        )}
      </div>
    </>
  );
}
