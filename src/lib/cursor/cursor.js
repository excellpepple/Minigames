// create the cursor and allow it to interact with the webpage
import { getClickableElements } from "./utils.js";

// initialize the cursor's position to be in the center of the screen
let prevX = window.innerWidth / 2 || 0;
let prevY = window.innerHeight / 2 || 0;

//determine which hand is being detected
export function onResultsHandler(results) {
  // Find cursor element each frame (DOM may not exist at module load)
  const cursor = typeof document !== "undefined" ? document.getElementById("cursor") : null;
  if (!cursor) return;

  let hand = null;
  if (results.rightHandLandmarks?.length) {
    hand = results.rightHandLandmarks;
  } else if (results.leftHandLandmarks?.length) {
    hand = results.leftHandLandmarks;
  }

//no hand detected
  if (!hand) return;

  //track the index fingertip
  const indexTip = hand[8];
  if (!indexTip) return;

  // Map hand coordinates to screen coordinates and prefer the visible video element
  const getVisibleVideo = () => {
    try {
      const vids = Array.from(document.querySelectorAll("video"));
      const visible = vids.find((v) => {
        const r = v.getBoundingClientRect();
        const style = window.getComputedStyle(v);
        return r.width > 8 && r.height > 8 && style.visibility !== "hidden" && parseFloat(style.opacity) > 0;
      });
      return visible || document.getElementById("video");
    } catch (e) {
      return document.getElementById("video");
    }
  };

  const visibleVideo = getVisibleVideo();
  const videoRect = visibleVideo ? visibleVideo.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  // detect whether the displayed video is mirrored (e.g., transform: scaleX(-1))
  const transform = visibleVideo ? window.getComputedStyle(visibleVideo).transform : "";
  const objectFit = visibleVideo ? (window.getComputedStyle(visibleVideo).objectFit || "cover") : "cover";
  const isMirrored = /matrix\(\s*-1\b|scaleX\(-1\)/.test(transform);

  // Calculate displayed video dimensions accounting for object-fit
  let displayedWidth = videoRect.width;
  let displayedHeight = videoRect.height;
  let displayedLeft = videoRect.left;
  let displayedTop = videoRect.top;

  if (visibleVideo && visibleVideo.videoWidth > 0 && visibleVideo.videoHeight > 0) {
    const videoNaturalW = visibleVideo.videoWidth;
    const videoNaturalH = visibleVideo.videoHeight;
    const scaleX = videoRect.width / videoNaturalW;
    const scaleY = videoRect.height / videoNaturalH;
    if (objectFit === "cover") {
      const scale = Math.max(scaleX, scaleY);
      displayedWidth = videoNaturalW * scale;
      displayedHeight = videoNaturalH * scale;
      const offsetX = Math.max(0, (displayedWidth - videoRect.width) / 2);
      const offsetY = Math.max(0, (displayedHeight - videoRect.height) / 2);
      displayedLeft = videoRect.left - offsetX;
      displayedTop = videoRect.top - offsetY;
    } else if (objectFit === "contain") {
      const scale = Math.min(scaleX, scaleY);
      displayedWidth = videoNaturalW * scale;
      displayedHeight = videoNaturalH * scale;
      const offsetX = Math.max(0, (videoRect.width - displayedWidth) / 2);
      const offsetY = Math.max(0, (videoRect.height - displayedHeight) / 2);
      displayedLeft = videoRect.left + offsetX;
      displayedTop = videoRect.top + offsetY;
    } else {
      // fill/none: fallback to container box
      displayedWidth = videoRect.width;
      displayedHeight = videoRect.height;
      displayedLeft = videoRect.left;
      displayedTop = videoRect.top;
    }
  }

  // Map normalized coordinates from MediaPipe to the displayed video box
  let x = displayedLeft + (isMirrored ? (displayedWidth - indexTip.x * displayedWidth) : (indexTip.x * displayedWidth));
  let y = displayedTop + indexTip.y * displayedHeight;


  // make cursor movement smooth and reduce jitter at edges by adapting smoothing
  const dx = Math.abs(x - prevX);
  const dy = Math.abs(y - prevY);
  // larger changes should be allowed to move faster; we reduce jitter for small changes
  const smoothing = 0.25; // base smoothing [0..1], lower = snappier, higher = smoother
  const adaptive = 1 / (1 + Math.max(dx, dy) * 0.02); // adapt smoothing with movement size
  const s = smoothing + (adaptive * (1 - smoothing));
  prevX += (x - prevX) * (1 - s);
  // apply extra smoothing for Y when close to the bottom edge to reduce jitter
  const vpw = window.innerWidth || document.documentElement.clientWidth;
  const vph = window.innerHeight || document.documentElement.clientHeight;
  const bottomDistance = Math.max(0, vph - y);
  const extraSmooth = bottomDistance < 80 ? (1 - bottomDistance / 80) * 0.6 : 0;
  const sY = Math.min(0.98, s + extraSmooth * (1 - s));
  prevY += (y - prevY) * (1 - sY);

  // Ensure cursor stays in viewport bounds (small pixel-clamp). This avoids jumps when video mapping is out of view.
  prevX = Math.max(0, Math.min(vpw, prevX));
  prevY = Math.max(0, Math.min(vph, prevY));

  // update cursor position (translate center of element to the point)
  cursor.style.left = `${prevX}px`;
  cursor.style.top = `${prevY}px`;
  cursor.style.transform = "translate(-50%, -50%)";

  // Manage hover visual state on clickable elements (do not dispatch clicks here — React hook handles clicks)
  const clickableElements = getClickableElements();
  let hovering = false;
  clickableElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (prevX > rect.left && prevX < rect.right && prevY > rect.top && prevY < rect.bottom) {
      // Mark as hovered for styling
      el.dataset.virtualHover = "true";
      el.classList?.add?.("virtual-hover");
      hovering = true;
    } else {
      if (el.dataset && el.dataset.virtualHover) {
        delete el.dataset.virtualHover;
        el.classList?.remove?.("virtual-hover");
      }
    }
  });

  // If not hovering any element, clear hover state
  if (!hovering) {
    // If a previously hovered element is tracked, we clear its state
    // (We don't keep hoverElement here as cursor.js remains stateless between frames)
  }
}