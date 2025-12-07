// gesture.js
import Phaser from "phaser";
import { onLandmarks } from "../phaser/inputs/trackingEvents.js";
import { loadGestureModel } from "./tfjsLoader.js";
import labels from "../../../public/models/labels.json";

// Flatten a specific hand's landmarks into [x1,y1,z1,...]
function flattenHand(landmarks, handPrefix) {
    const handLandmarks = landmarks.filter(l => l.name.startsWith(handPrefix));

    if (handLandmarks.length !== 21) return null;

    return handLandmarks.flatMap(l => [l.x, l.y, l.z]);
}
//TODO: Add a config method to the gesture input to change stability controls.
// ---- Stability System State ----
const WINDOW = 5;
const MIN_CONF = 0.65;
const HOLD_FRAMES = 3;

let smoothBuffer = [];
let lockedGesture = null;
let holdCount = 0;

// Utility: majority vote
function mode(arr) {
    const freq = {};
    for (const x of arr) freq[x] = (freq[x] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

// Stable gesture logic
function processStableGesture(predArray) {
    const maxIndex = predArray.indexOf(Math.max(...predArray));
    const confidence = predArray[maxIndex];

    // Low confidence: ignore frame entirely
    if (confidence < MIN_CONF) {
        return lockedGesture;
    }

    // Add to smoothing buffer
    smoothBuffer.push(maxIndex);
    if (smoothBuffer.length > WINDOW) smoothBuffer.shift();

    const smoothed = Number(mode(smoothBuffer));

    // Initial lock
    if (lockedGesture === null) {
        lockedGesture = smoothed;
        return lockedGesture;
    }

    if (smoothed === lockedGesture) {
        holdCount = 0;
        return lockedGesture;
    }

    // Gesture differs, increase hold count
    holdCount++;

    // After enough stable frames, switch gesture
    if (holdCount >= HOLD_FRAMES) {
        lockedGesture = smoothed;
        holdCount = 0;
    }

    return lockedGesture;
}

export class GestureDetected extends Phaser.Events.EventEmitter {
    constructor(scene) {
        super();
        this.scene = scene;

        this.model = null;
        this.prevGesture = null;
        this._unsubscribe = null;
        this._modelLoading = null;
    }

    async start() {
        if (!this._modelLoading) {
            this._modelLoading = loadGestureModel("/models/tfjs_model/export_tfjs/model.json");
        }

        this.model = await this._modelLoading;

        this._unsubscribe = onLandmarks(async (landmarks) => {
            if (!this.model || !landmarks || !landmarks.length) return;

            const flatInput =
                flattenHand(landmarks, "right_hand") ||
                flattenHand(landmarks, "left_hand");

            if (!flatInput) return;

            let output;
            try {
                output = this.model.predict(flatInput);   // Float32Array softmax
            } catch (err) {
                console.error("Prediction error:", err);
                return;
            }

            // Use stability logic
            const stableIndex = processStableGesture(output);
            if (stableIndex == null) return;

            const gestureName = this._mapGesture(stableIndex);
            if (!gestureName) return;

            // Emit continuous state
            this.emit("gesture-detected", gestureName);

            // Emit change events
            if (gestureName !== this.prevGesture) {
                this.prevGesture = gestureName;
                this.emit("gesture-changed", gestureName);
            }
        });


        console.log("Gesture tracking started");
    }

    stop() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }

    _argmax(arr) {
        let max = -Infinity;
        let index = -1;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
                index = i;
            }
        }
        return index;
    }

    _mapGesture(idx) {
        return labels[idx] || "unknown";
    }
}
