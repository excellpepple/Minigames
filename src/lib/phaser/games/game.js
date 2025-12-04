import { TrackingInput } from '../inputs/trackingInputs.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Load assets before starting to avoid vite/react issues
    this.load.image('background', '/assets/background-day.png');
    this.load.image('pipe_top', '/assets/pipe-green-top.png');
    this.load.image('pipe_bottom', '/assets/pipe-green-bottom.png');
    this.load.image('ground', '/assets/ground-sprite.png');
    this.load.image('player', '/assets/bird-blue-sprite.png');

    // Basic audio: background track, death, and point ding
    this.load.audio('bg_track', '/audio1/bg_track.mp3');
    this.load.audio('die', '/audio1/die.mp3');
    this.load.audio('point', '/audio1/point.mp3');
  }

  create() {
    // Add background daytime image
    this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
    this.background.setDisplaySize(this.scale.width, this.scale.height);

    // Make world bounds
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    // Create ground sprite
    this.ground = this.physics.add.staticImage(this.scale.width / 2, this.scale.height - 40, 'ground');
    this.ground.setDisplaySize(this.scale.width, this.ground.height);

    // Initialize player sprite
    this.player = this.physics.add.sprite(100, this.scale.height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(0); // initialize without gravity
    this.player.body.allowGravity = true;
    this.gravityEnabled = false;

    // Audio instances
    this.bgMusic = this.sound.add('bg_track', { loop: true, volume: 0.5 });
    this.dieSound = this.sound.add('die', { volume: 0.7 });
    this.pointSound = this.sound.add('point', { volume: 0.6 });
    this.bgMusic.play();

    // Nose tracking input
    //Only start gravity after the tracking is loaded
    this.tracking = new TrackingInput(this);
    this.tracking.start();
    this.tracking.on('landmarks', (landmarks) => {
      const nose = landmarks.find(l => l.name === 'nose_tip');
      if (nose) {
        const targetY = nose.y * this.scale.height;
        const diff = targetY - this.player.y;
        this.player.setVelocityY(diff * 5);

        // enable gravity
        if (!this.gravityEnabled) {
          this.player.setGravityY(800);
          this.gravityEnabled = true;
        }
      }
    });

    // Consistently spawn in new pipes
    this.pipes = this.physics.add.group();
    const pipeVelocity = 200; // pipe speed in px/sec
    const desiredSpacing = 600; // min horizontal space between sets
    const spawnDelay = (desiredSpacing / pipeVelocity) * 1000; // ms

    this.time.addEvent({
      delay: spawnDelay,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true
    });

    // If you collide with the ground or the pipes, the game ends
    this.physics.add.collider(this.player, this.ground, this.gameOver, null, this);
    this.physics.add.overlap(this.player, this.pipes, this.gameOver, null, this);

    // Track score
    this.score = 0;
    this.scoreText = this.add.text(10, 10, "0", { fontSize: "24px", fill: "#fff" });

    this.isGameOver = false;
  }

  spawnPipes() {
    if (this.isGameOver) return;

    //create gaps between pipes
    const gapSize = Phaser.Math.Between(180, 220);
    const minGapY = 120;
    const maxGapY = this.scale.height - gapSize - 120;
    const gapY = Phaser.Math.Between(minGapY, maxGapY);
    const pipeX = this.scale.width + 50;

    // Place top pipe
    const pipeTop = this.pipes.create(pipeX, gapY, 'pipe_top');
    pipeTop.setOrigin(0.5, 1);
    pipeTop.body.allowGravity = false;
    pipeTop.setVelocityX(-200);
    pipeTop.scored = false;

    // Place bottom pipe
    const pipeBottom = this.pipes.create(pipeX, gapY + gapSize, 'pipe_bottom');
    pipeBottom.setOrigin(0.5, 0);
    pipeBottom.body.allowGravity = false;
    pipeBottom.setVelocityX(-200);
  }

  //update the score as long as the game isn't over
  update() {
    if (this.isGameOver) return;

    this.pipes.getChildren().forEach(pipe => {
      if (!pipe.scored && pipe.y > this.scale.height / 2 && pipe.x < this.player.x) {
        pipe.scored = true;
        this.score++;
        this.scoreText.setText(this.score.toString());
        if (this.pointSound) {
          this.pointSound.play();
        }
      }

      if (pipe.x < -50) pipe.destroy();
    });
  }

  //Call when player loses game
  gameOver() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.physics.pause();

    if (this.bgMusic) {
      this.bgMusic.stop();
    }
    if (this.dieSound) {
      this.dieSound.play();
    }

    this.add.text(
      this.scale.width / 2 - 60,
      this.scale.height / 2 - 20,
      "GAME OVER, SPACE TO RESTART",
      { fontSize: '32px', fill: '#ff0000' }
    );

    // press space to restart
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  //used to stop the tracking when you leave the page
  shutdown() {
    if (this.tracking) this.tracking.stop();
    if (this.bgMusic) this.bgMusic.stop();
  }
}