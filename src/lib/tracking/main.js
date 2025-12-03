//start all required processes, including the video background frame to be tracked, and the
//tracking itself

import { startCamera } from "../tracking/camera.js";
import { createHolisticTracker } from "../tracking/tracker.js";

const getVideoElement = () => {
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

const holistic = createHolisticTracker();

(async () => {
  let started = false;
  async function processFrame() {
    const video = getVideoElement();
    if (!video) {
      requestAnimationFrame(processFrame);
      return;
    }
    // Start camera if it hasn't already been started
    if (!video.srcObject && !started) {
      await startCamera(video);
      started = true;
    }
    await holistic.send({ image: video });
    requestAnimationFrame(processFrame);
  }
  processFrame();
})();
