import Phaser from 'phaser';
import BubbleScene from './bubbleGame.js';

export default function createBubbleGame(parentId) {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parentId,
    transparent: true,
    scene: [BubbleScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };
  return new Phaser.Game(config);
}
