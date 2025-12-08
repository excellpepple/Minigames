import { GestureDetected } from '../../gesture/gesture.js';
import { TrackingInput } from '../inputs/trackingInputs.js';

export default class GameScene extends Phaser.Scene {
  constructor({ onScoreChange } = {}) {
    super('GameScene');

    this.onScoreChange = onScoreChange || (() => {});
    this.tracking = null;
    this.gesture = null;
  }

  preload() {
    this.load.image('background', '/assets/background-day.png');
    this.load.image('pipe_top', '/assets/pipe-green-top.png');
    this.load.image('pipe_bottom', '/assets/pipe-green-bottom.png');
    this.load.image('ground', '/assets/ground-sprite.png');
    this.load.image('player', '/assets/bird-blue-sprite.png');

    this.load.audio('bg_track', '/audio1/bg_track.mp3');
    this.load.audio('die', '/audio1/die.mp3');
    this.load.audio('point', '/audio1/point.mp3');
  }

  create() {
    // ⭐ REGISTER CLEANUP HANDLERS FOR SCENE SHUTDOWN
    this.events.on("shutdown", () => this._cleanup());
    this.events.on("destroy", () => this._cleanup());

    // Background
    this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
    this.background.setDisplaySize(this.scale.width, this.scale.height);

    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    // Ground
    this.ground = this.physics.add.staticImage(this.scale.width / 2, this.scale.height - 40, 'ground');
    this.ground.setDisplaySize(this.scale.width, this.ground.height);

    // Player
    this.player = this.physics.add.sprite(100, this.scale.height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(0);
    this.player.body.allowGravity = true;
    this.gravityEnabled = false;

    // Audio
    this.bgMusic = this.sound.add('bg_track', { loop: true, volume: 0.5 });
    this.dieSound = this.sound.add('die', { volume: 0.7 });
    this.pointSound = this.sound.add('point', { volume: 0.6 });
    this.bgMusic.play();

    // ⭐ TRACKING INPUT
    this.tracking = new TrackingInput(this);
    this.tracking.start();

    this.tracking.on('landmarks', (landmarks) => {
      if (!this.player || this.isGameOver) return;

      const nose = landmarks.find(l => l.name === 'nose_tip');
      if (nose) {
        const targetY = nose.y * this.scale.height;
        const diff = targetY - this.player.y;
        this.player.setVelocityY(diff * 5);

        if (!this.gravityEnabled) {
          this.player.setGravityY(800);
          this.gravityEnabled = true;
        }
      }
    });

    // ⭐ GESTURE INPUT
    this.gesture = new GestureDetected(this);
    this.gesture.start();
    this.gesture.on("gesture-changed", gesture => {
      console.log(`Gesture Detected: ${gesture}`)

      if (gesture == "mute"){
        this.bgMusic.stop();
        this.dieSound.stop();
        this.pointSound.stop();
      }
      if (gesture == "call"){
        this.bgMusic.play();
        this.dieSound.play();
        this.pointSound.play();
      }
    })

    // Pipes
    this.pipes = this.physics.add.group();
    const pipeVelocity = 200;
    const desiredSpacing = 600;
    const spawnDelay = (desiredSpacing / pipeVelocity) * 1000;

    this.time.addEvent({
      delay: spawnDelay,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true
    });

    this.physics.add.collider(this.player, this.ground, this.gameOver, null, this);
    this.physics.add.overlap(this.player, this.pipes, this.gameOver, null, this);

    this.score = 0;
    this.scoreText = this.add.text(10, 10, "0", { fontSize: "24px", fill: "#fff" });

    this.isGameOver = false;
  }

  spawnPipes() {
    if (this.isGameOver) return;

    const gapSize = Phaser.Math.Between(180, 220);
    const minGapY = 120;
    const maxGapY = this.scale.height - gapSize - 120;
    const gapY = Phaser.Math.Between(minGapY, maxGapY);
    const pipeX = this.scale.width + 50;

    const pipeTop = this.pipes.create(pipeX, gapY, 'pipe_top');
    pipeTop.setOrigin(0.5, 1);
    pipeTop.body.allowGravity = false;
    pipeTop.setVelocityX(-200);
    pipeTop.scored = false;

    const pipeBottom = this.pipes.create(pipeX, gapY + gapSize, 'pipe_bottom');
    pipeBottom.setOrigin(0.5, 0);
    pipeBottom.body.allowGravity = false;
    pipeBottom.setVelocityX(-200);
  }

  update() {
    if (this.isGameOver) return;

    this.pipes.getChildren().forEach(pipe => {
      // ⭐ SCORE CALCULATION FIX + REACT CALLBACK
      if (!pipe.scored && pipe.y > this.scale.height / 2 && pipe.x < this.player.x) {
        pipe.scored = true;
        this.score++;
        this.scoreText.setText(this.score.toString());

        // ⭐ SEND SCORE UPDATE TO REACT (the missing piece!)
        if (this.onScoreChange) {
          try {
            this.onScoreChange(this.score);
          } catch (err) {
            console.warn("Score callback failed:", err);
          }
        }

        if (this.pointSound) this.pointSound.play();
      }

      if (pipe.x < -50) pipe.destroy();
    });
  }

  gameOver() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.physics.pause();

    if (this.bgMusic) this.bgMusic.stop();
    if (this.dieSound) this.dieSound.play();

    this.add.text(
      this.scale.width / 4,
      this.scale.height / 4,
      "GAME OVER, SPACE TO RESTART",
      { fontSize: '32px', fill: '#ff0000' }
    );
    this.events.emit("shutdown");

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  // ⭐ CLEANUP CALLED ON DESTROY/SHUTDOWN
  _cleanup() {
    if (this.tracking) {
      this.tracking.stop();
      this.tracking = null;
    }

    if (this.gesture) {
      this.gesture.stop?.();
      this.gesture = null;
    }

    if (this.bgMusic) {
      this.bgMusic.stop();
      this.bgMusic = null;
    }
  }
}