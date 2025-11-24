// noseTracker.js
import { emitLandmarks } from "../phaser/inputs/trackingEvents.js";

export function createTracker() {
  const holistic = new Holistic({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
  });

  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.9,
  });

  holistic.onResults((results) => {
    const landmarks = [];

    if (results.poseLandmarks) {
      landmarks.push({ name: "nose_tip", ...results.poseLandmarks[0] });
    }

    if (results.rightHandLandmarks) {
      landmarks.push({ name: "right_index", ...results.rightHandLandmarks[8] });
    }

    if (results.leftHandLandmarks) {
      landmarks.push({ name: "left_index", ...results.leftHandLandmarks[8] });
    }

    if (landmarks.length > 0) {
      emitLandmarks(landmarks);
    }
  });

  return holistic;
}