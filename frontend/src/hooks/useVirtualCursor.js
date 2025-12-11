import { useEffect, useRef, useState } from "react";
import { startCamera } from "../lib/tracking/camera.js";

/**
 * Custom hook to initialize and manage the virtual cursor system
 * This hook handles camera initialization and the virtual cursor pipeline
 */
export function useVirtualCursor() {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [boot, setBoot] = useState("init");

  // Start camera
  useEffect(() => {
    let stream = null;
    async function initCamera() {
      if (!videoRef.current) return;
      try {
        await startCamera(videoRef.current);
        stream = videoRef.current.srcObject;
        setIsLoaded(true);
      } catch (err) {
        console.error("Camera initialization failed:", err);
        setCameraError(true);
      }
    }
    if (navigator.mediaDevices?.getUserMedia) initCamera();
    else setCameraError(true);

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Load virtual cursor pipeline once camera is ready
  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    const waitForHolistic = (timeoutMs = 12000) =>
      new Promise((resolve, reject) => {
        const start = Date.now();
        (function check() {
          if (cancelled) return;
          const ok =
            (typeof window !== "undefined" && window.Holistic) ||
            (typeof window !== "undefined" &&
              window.holistic &&
              window.holistic.Holistic);
          if (ok) return resolve();
          if (Date.now() - start > timeoutMs)
            return reject(new Error("Holistic not available"));
          requestAnimationFrame(check);
        })();
      });

    (async () => {
      try {
        setBoot("loading");
        await waitForHolistic();
        await new Promise((r) => setTimeout(r, 300)); // let video settle
        const url = new URL("../lib/tracking/main.js", import.meta.url).href;
        await import(/* @vite-ignore */ url);
        console.log("✅ Virtual cursor initialized");
        if (!cancelled) setBoot("ready");
      } catch (e) {
        console.error("❌ Failed to init virtual cursor:", e);
        if (!cancelled) setBoot("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded]);

  return { videoRef, cameraError, isLoaded, boot };
}

/**
 * Hook to handle dwell-to-click functionality for the virtual cursor
 * This detects when the cursor hovers over clickable elements and clicks after a delay
 */
export function useDwellToClick(isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return;

    const cursorEl =
      typeof document !== "undefined"
        ? document.getElementById("cursor")
        : null;
    if (!cursorEl) return;

    let rafId = 0;
    let lastTarget = null;
    let lastStart = 0;
    const DWELL_MS = 600;

    const isClickable = (el) =>
      !!(
        el?.matches &&
        el.matches("button, a, [data-clickable], [role='button']")
      );

    const findClickable = (el) => {
      while (el) {
        if (isClickable(el)) return el;
        el = el.parentElement;
      }
      return null;
    };

    const loop = () => {
      try {
        const rect = cursorEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // cursor has pointer-events: none, so elementFromPoint hits what's under it
        let target = document.elementFromPoint(cx, cy);
        const clickable = findClickable(target);
        const now = performance.now();

        if (clickable !== lastTarget) {
          lastTarget = clickable;
          lastStart = now;
        } else if (clickable && now - lastStart >= DWELL_MS) {
          // Dispatch a real click
          clickable.click?.();
          // Prevent rapid re-clicks on same element
          lastStart = now + 1e9;
          setTimeout(() => {
            lastStart = performance.now();
          }, 350);
        }
      } catch {}
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isEnabled]);
}

