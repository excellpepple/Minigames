import Phaser from "phaser";
import GameScene from "./game.js";

export default function createGame(parentId) {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parentId,
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',   // enable Arcade Physics
      arcade: {
        gravity: { y: 0 }, // start with no gravity, you can change it in the scene
        debug: false
      }
    },
    // make canvas transparent so camera DOM element can be visible behind it
    transparent: true
  };

  const game = new Phaser.Game(config);
  return game;
}
