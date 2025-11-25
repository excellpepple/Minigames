//start all required processes, including the video background frame to be tracked, and the
//tracking itself

import { startCamera } from "./camera.js";
import { createHolisticTracker } from "./tracker.js";

const video = document.getElementById("video");

if (!video) {
  console.error("Video element not found");
}

const holistic = createHolisticTracker();

(async () => {
  if (!video) {
    console.error("Cannot start tracking: video element not found");
    return;
  }
  
  // Start camera only if it's not already initialized
  if (!video.srcObject) {
    await startCamera(video);
  }
  async function processFrame() {
    await holistic.send({ image: video });
    requestAnimationFrame(processFrame);
  }
  processFrame();
})();
