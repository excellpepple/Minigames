import { onLandmarks } from "../inputs/trackingEvents.js";

export default class BubbleScene extends Phaser.Scene {
  constructor() {
    super("BubbleScene");
  }

  preload() {
    // We'll paint circle textures procedurally for colorful bubbles
    // Optionally add a pop sound later
  }

  create() {
    // Keep canvas transparent so the video element below remains visible.
    // If you prefer a solid background, set a color here with `this.cameras.main.setBackgroundColor('#87CEEB');`

    // Create a procedural bubble texture using Graphics
    const g = this.add.graphics();
    const bubbleRadius = 28;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(bubbleRadius, bubbleRadius, bubbleRadius);
    g.generateTexture('bubble', bubbleRadius * 2, bubbleRadius * 2);
    g.destroy();

    // Group for bubbles
    this.bubbles = this.physics.add.group();

    // Score & top score from localStorage
    this.score = 0;
    this.scoreText = this.add.text(this.scale.width - 16, 16, '0', {
      fontSize: '20px',
      color: '#003',
      stroke: '#ffffff',
      strokeThickness: 4,
      fontFamily: 'Arial'
    }).setOrigin(1, 0);
    this.topScore = 0;
    try {
      const stored = localStorage.getItem('bubble-top-score');
      this.topScore = stored ? parseInt(stored, 10) || 0 : 0;
    } catch (e) { this.topScore = 0; }
    this.topScoreText = this.add.text(this.scale.width - 16, 40, `Best: ${this.topScore}`, {
      fontSize: '14px',
      color: '#003',
      stroke: '#fff',
      strokeThickness: 4,
      fontFamily: 'Arial'
    }).setOrigin(1, 0);

    // Timer (60s game)
    this.timeLeft = 60;
    this.timeText = this.add.text(16, 16, `Time: ${this.timeLeft}`, {
      fontSize: '18px',
      color: '#003',
      stroke: '#fff',
      strokeThickness: 4,
      fontFamily: 'Arial'
    }).setOrigin(0, 0);
    this._timerEvent = this.time.addEvent({ delay: 1000, callback: () => {
      this.timeLeft -= 1;
      if (this.timeLeft < 0) this.timeLeft = 0;
      this.timeText.setText(`Time: ${this.timeLeft}`);
      if (this.timeLeft === 0) {
        this.endGame();
      }
    }, loop: true });

    // Spawn initial bubbles
    for (let i = 0; i < 8; i++) {
      this.spawnBubble();
    }

    // Listen for landmarks
    this.pointer = { x: this.scale.width / 2, y: this.scale.height / 2 };
    this._unsubscribe = onLandmarks((landmarks) => {
      // prefer right index then left index then nose
      const index = landmarks.find((l) => l.name === 'right_index') || landmarks.find((l) => l.name === 'left_index') || landmarks.find((l) => l.name === 'nose_tip');
      if (index) {
        // Map normalized coordinates to world
        this.pointer.x = index.x * this.scale.width;
        this.pointer.y = index.y * this.scale.height;
      }
    });

    // Pointer (mouse) support too
    this.input.on('pointerdown', (p) => {
      this.tryPopAt(p.x, p.y);
    });

    // Pop when pointer enters bubble area - constant checking in update
    // Particle for pop
    const pr = this.add.graphics();
    pr.fillStyle(0xffffff, 1);
    pr.fillCircle(6, 6, 6);
    pr.generateTexture('pop', 12, 12);
    pr.destroy();

    this.popEmitter = this.add.particles('pop').createEmitter({
      speed: { min: -150, max: 150 },
      scale: { start: 0.75, end: 0 },
      lifespan: 500,
      on: false,
      quantity: 6
    });
    this._lastPopTime = 0;
    this.isGameOver = false;
  }

  spawnBubble() {
    const radius = Phaser.Math.Between(22, 40);
    // spawn near bottom with random x
    const x = Phaser.Math.Between(radius, this.scale.width - radius);
    const y = Phaser.Math.Between(this.scale.height - 120, this.scale.height - 40);
    const bubble = this.add.sprite(x, y, 'bubble');
    bubble.setDisplaySize(radius * 2, radius * 2);
    // tint and blend for colorful bubbles
    bubble.setTint(Phaser.Display.Color.GetColor(Phaser.Math.Between(160, 255), Phaser.Math.Between(120, 255), Phaser.Math.Between(160, 255)));
    this.bubbles.add(bubble);

    // Velocity up and slight horizontal wander
    const speedY = Phaser.Math.Between(40, 80);
    const vx = Phaser.Math.Between(-20, 20);
    this.physics.world.enable(bubble);
    bubble.body.setVelocity(vx, -speedY);
    bubble.body.setAllowGravity(false);
    bubble.radius = radius;
    bubble.popped = false;
  }

  tryPopAt(x, y) {
    const now = this.time && this.time.now ? this.time.now : Date.now();
    if (now - this._lastPopTime < 180) return false;
    let poppedAny = false;
    this.bubbles.getChildren().forEach((b) => {
      const dx = b.x - x;
      const dy = b.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!b.popped && dist < b.displayWidth / 2) {
        poppedAny = true;
        this.popBubble(b);
      }
    });
    if (poppedAny) this._lastPopTime = now;
    return poppedAny;
  }

  popBubble(b) {
    if (!b || b.popped) return;
    b.popped = true;
    this.popEmitter.setPosition(b.x, b.y);
    this.popEmitter.explode();
    // animation
    this.tweens.add({
      targets: b,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        b.destroy();
      }
    });
    this.score += 1;
    this.scoreText.setText(this.score);
    // Spawn a new bubble after a short delay
    this.time.addEvent({ delay: 700, callback: this.spawnBubble, callbackScope: this });
  }

  endGame() {
    // stop spawning and freeze bubbles, show summary
    this.isGameOver = true;
    // freeze bubbles
    this.bubbles.getChildren().forEach(b => b.body.setVelocity(0, 0));
    // stop the timer
    if (this._timerEvent) this._timerEvent.remove();
    this.add.text(this.scale.width/2, this.scale.height/2, `Final Score: ${this.score}`, { fontSize: '28px', color: '#fff', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);
    if (this.score > this.topScore) {
      this.topScore = this.score;
      try { localStorage.setItem('bubble-top-score', String(this.topScore)); } catch (e) {}
      if (this.topScoreText) this.topScoreText.setText(`Best: ${this.topScore}`);
    }
  }

  update() {
    if (this.isGameOver) return;
    // if bubbles go off top, reposition them at bottom
    this.bubbles.getChildren().forEach((b) => {
      if (b.y < -50) {
        // respawn at bottom
        const radius = Phaser.Math.Between(22, 40);
        b.setDisplaySize(radius * 2, radius * 2);
        b.x = Phaser.Math.Between(radius, this.scale.width - radius);
        b.y = Phaser.Math.Between(this.scale.height - 90, this.scale.height + 30);
        b.body.setVelocity(Phaser.Math.Between(-20, 20), -Phaser.Math.Between(40, 80));
        b.popped = false;
        b.alpha = 1;
        b.scale = 1;
      }
    });

    // try popping at pointer (landmark) location when it is steady — simple check convert pointer coords
    if (this.pointer) {
      this.tryPopAt(this.pointer.x, this.pointer.y);
    }
  }

  // cleanup
  shutdown() {
    if (this._unsubscribe) this._unsubscribe();
    try { if (this._timerEvent) this._timerEvent.remove(); } catch {}
    try { if (this.popEmitter) this.popEmitter.manager.removeEmitter(this.popEmitter); } catch {}
  }
}
