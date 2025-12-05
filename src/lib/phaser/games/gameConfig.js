import Phaser from "phaser";
import GameScene from "./game.js";

export default function createGame(parentId, { onScoreChange } = {}) {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parentId,
    scene: [ new GameScene({ onScoreChange }) ],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    transparent: true
  };

  const game = new Phaser.Game(config);
  return game;
