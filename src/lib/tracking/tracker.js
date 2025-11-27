//instantiates hand tracking and connects it to the cursor
import { onResultsHandler } from "../Cursor/cursor.js";

export function createHolisticTracker() {
  const holistic = new Holistic({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
  });

  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.9
  });

  holistic.onResults(onResultsHandler);
  return holistic;
}

