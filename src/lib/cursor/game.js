import { TrackingInput } from './input/trackingInput.js';

let sprite;
let trackingInput;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('player', '/assets/player.png');
  }

  create() {
    sprite = this.add.sprite(400, 300, 'player');
    
    trackingInput = new TrackingInput(this);
    trackingInput.start();

    const targetLandmark = 'nose_tip';

    trackingInput.on('landmarks', (landmarks) => {
      const lm = landmarks.find(l => l.name === targetLandmark);
      if (lm) {
        // Map normalized MediaPipe coordinates to Phaser world
        sprite.x = lm.x * this.scale.width;
        sprite.y = lm.y * this.scale.height;
      }
    });
  }

  shutdown() {
    if (trackingInput) trackingInput.stop();
  }
}

