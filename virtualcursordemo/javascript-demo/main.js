import { startCamera } from "./camera.js";
import { moveButtonRandom } from "./utils.js";
import { createHolisticTracker } from "./tracker.js";

const video = document.getElementById("video");

// move all demo buttons randomly
document.querySelectorAll('.button').forEach(btn => {
  moveButtonRandom(btn);
  btn.addEventListener('click', () => moveButtonRandom(btn));
});

const holistic = createHolisticTracker();

(async () => {
  await startCamera(video);
  async function processFrame() {
    await holistic.send({ image: video });
    requestAnimationFrame(processFrame);
  }
  processFrame();
})();
