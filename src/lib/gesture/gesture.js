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

            // Try right hand first, then left hand
            const flatInput = flattenHand(landmarks, "right_hand") || flattenHand(landmarks, "left_hand");
            if (!flatInput) return;

            // Logging for debugging
            // console.log("Flat input length:", flatInput.length);

            // console.log("Flat input is Array?", Array.isArray(flatInput));
            // console.log("Flat input all numbers?", flatInput.every(n => typeof n === "number"));

            // console.log("First 5 landmark triplets:");
            // for (let i = 0; i < 5; i++) {
            //     const base = i * 3;
            //     console.log(`L${i}: x=${flatInput[base]}, y=${flatInput[base + 1]}, z=${flatInput[base + 2]}`);
            // }

            let output;
            try {
                
                output = this.model.predict(flatInput);
                // console.log("Raw model output (first 5 values):", Array.from(output).slice(0, 5));
            } catch (err) {
                console.error("Prediction error:", err);
                return;
            }



            const gestureIndex = this._argmax(output);
            const gestureName = this._mapGesture(gestureIndex);

            if (!gestureName) {
                console.warn("No gesture matched for index", gestureIndex);
                return;
            }
            

            this.emit("gesture-detected", gestureName);

            if (gestureName !== this.prevGesture) {
                this.prevGesture = gestureName;
                this.emit("gesture-changed", gestureName);
            }

            // console.log("Detected gesture:", gestureName);
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
