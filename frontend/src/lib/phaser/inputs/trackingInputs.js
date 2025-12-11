import Phaser from 'phaser';
import { onLandmarks } from './trackingEvents.js';

export class TrackingInput extends Phaser.Events.EventEmitter {
  constructor(scene) {
    super();
    this.scene = scene;
    this._unsubscribe = null;
  }

  start() {
    this._unsubscribe = onLandmarks((landmarks) => {
      this.emit('landmarks', landmarks);
    });
  }

  stop() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }
}
