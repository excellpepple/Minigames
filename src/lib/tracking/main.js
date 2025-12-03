//start all required processes, including the video background frame to be tracked, and the
//tracking itself

import { startCamera } from "../tracking/camera.js";
import { createHolisticTracker } from "../tracking/tracker.js";

// Always prefer the global video element (id="video") from App.jsx
// This ensures the virtual cursor works consistently even when games create their own videos
const getVideoElement = () => {
  try {
    // First, try to get the global video element (preferred)
    const globalVideo = document.getElementById("video");
    if (globalVideo && globalVideo.srcObject) {
      return globalVideo;
    }
    // Fallback: find any visible video element
    const vids = Array.from(document.querySelectorAll("video"));
    const visible = vids.find((v) => {
      const r = v.getBoundingClientRect();
      const style = window.getComputedStyle(v);
      return r.width > 8 && r.height > 8 && style.visibility !== "hidden" && parseFloat(style.opacity) > 0;
    });
    return visible || globalVideo;
  } catch (e) {
    return document.getElementById("video");
  }
};

const holistic = createHolisticTracker();

(async () => {
  let started = false;
  let rafId = null;
  let cancelled = false;
  
  async function processFrame() {
    if (cancelled) return;
    
    const video = getVideoElement();
    if (!video) {
      rafId = requestAnimationFrame(processFrame);
      return;
    }
    
    // Start camera if it hasn't already been started
    if (!video.srcObject && !started) {
      try {
        await startCamera(video);
        started = true;
      } catch (err) {
        console.error("Failed to start camera for virtual cursor:", err);
        cancelled = true;
        return;
      }
    }
    
    // Only process if video has a stream
    if (video.srcObject) {
      try {
        await holistic.send({ image: video });
      } catch (err) {
        // Silently handle errors (e.g., if tracker is busy)
        console.debug("Virtual cursor frame processing error:", err);
      }
    }
    
    rafId = requestAnimationFrame(processFrame);
  }
  
  processFrame();
  
  // Cleanup function (though this module should persist for the app lifetime)
  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
  };
})();
