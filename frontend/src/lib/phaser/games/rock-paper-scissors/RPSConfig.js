// RPSConfig.js
import Phaser from "phaser"
import MainScene from "./RPSGame"

export default function createGame(parentId, { onPlayerScoreChange, onComputerScoreChange, onGameEnd } = {}) {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parentId,
    scene: [
      new MainScene({
        onPlayerScoreChange,
        onComputerScoreChange,
        onGameEnd
      })
    ],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
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

  return new Phaser.Game(config);
}
