//start all required processes, including the video background frame to be tracked, and the
//tracking itself

import { startCamera } from "./camera.js";
import { createHolisticTracker } from "./tracker.js";

const video = document.getElementById("video");

const holistic = createHolisticTracker();

(async () => {
  await startCamera(video);
  async function processFrame() {
    await holistic.send({ image: video });
    requestAnimationFrame(processFrame);
  }
  processFrame();
})();
