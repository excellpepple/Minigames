//instantiates hand tracking and connects it to the cursor
import { onResultsHandler } from "./cursor.js";
import { emitLandmarks } from "./trackingEvents.js";

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

 holistic.onResults((results) => {
    // Keep existing cursor behavior
    onResultsHandler(results); 

    // prepare landmarks for Phaser / game input
    const landmarks = [];

    //insert landmarks you want to track for phaser.js inputs here

    if (results.poseLandmarks) {
      landmarks.push(
        { name: 'nose_tip', ...results.poseLandmarks[0] },
        { name: 'left_shoulder', ...results.poseLandmarks[11] },
        { name: 'right_shoulder', ...results.poseLandmarks[12] }
      );
    }

    if (results.rightHandLandmarks) {
      landmarks.push({ name: 'right_index', ...results.rightHandLandmarks[8] });
    }

    if (results.leftHandLandmarks) {
      landmarks.push({ name: 'left_index', ...results.leftHandLandmarks[8] });
    }

    if (landmarks.length > 0) {
      emitLandmarks(landmarks);
    }
  });

  return holistic;
}


