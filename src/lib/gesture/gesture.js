import Phaser from "phaser";
import { onLandmarks } from "../phaser/inputs/trackingEvents.js";
import { loadGestureModel } from "./tfliteloader.js";
import labels from "../../../public/models/labels.json";

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
            this._modelLoading = loadGestureModel("/models/export_tfjs/model.json");
        }

        this.model = await this._modelLoading;

        this._unsubscribe = onLandmarks(async (landmarks) => {
            if (!this.model || !landmarks) return;

            // landmarks is already array-like (63)
            const output = this.model.predict(landmarks);

            const gestureIndex = this._argmax(output);
            const gestureName = this._mapGesture(gestureIndex);

            this.emit("gesture-detected", gestureName);

            if (gestureName !== this.prevGesture) {
                this.prevGesture = gestureName;
                this.emit("gesture-changed", gestureName);
            }
        });
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
