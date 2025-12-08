import Phaser from "phaser";
import { GestureDetected } from "../../../gesture/gesture.js";
import { TrackingInput } from "../../inputs/trackingInputs.js";

const GESTURE_MAP = {
    fist: "rock",
    palm: "paper",
    peace: "scissors",
    "peace inverted": "scissors",
    peace_inverted: "scissors"
};

export default class MainScene extends Phaser.Scene {
    constructor({ onPlayerScoreChange, onComputerScoreChange, onGameEnd } = {}) {
        super("MainScene");

        this.playerGesture = null;
        this.roundActive = false;

        this.onPlayerScoreChange = onPlayerScoreChange || (() => {});
        this.onComputerScoreChange = onComputerScoreChange || (() => {});
        this.onGameEnd = onGameEnd || (() => {});

        this.playerScore = 0;
        this.computerScore = 0;
        this.MAX_SCORE = 5; // end at 5 points
    }

    create() {
        // Tracking
        this.tracking = new TrackingInput(this);
        this.tracking.start();

        this.events.on("shutdown", () => {
            console.log("RPS → Scene shutdown (NOT a game end)");
            this.roundActive = false;
            this.tracking?.stop?.();
            this.gesture?.stop?.();
        });

        this.events.on("destroy", () => {
            console.log("RPS → Scene destroyed (NOT a game end)");
            this.roundActive = false;
            this.tracking?.stop?.();
            this.gesture?.stop?.();
        });


        // Gestures
        this.gesture = new GestureDetected(this);
        this.gesture.start();

        this.resultText = this.add.text(150, 120, "Show gesture", {
            fontSize: 28
        });

        this.gesture.on("gesture-changed", g => {
            if (!this.roundActive) return;
            const mapped = GESTURE_MAP[g];
            if (!mapped) return;

            this.playerGesture = mapped;
            this.playRound();
        });

        this.startRound();
    }

    startRound() {
        this.roundActive = true;
        this.playerGesture = null;
        this.resultText.setText("Show gesture");
    }

    endGame() {
        console.log("RPS → GAME OVER, sending score to React");

        // Stop input
        this.roundActive = false;
        this.tracking?.stop?.();
        this.gesture?.stop?.();

        // Fire callback
        this.onGameEnd(this.playerScore);

        // ALSO fire Phaser event (React can detect this too)
        this.events.emit("gameover", { score: this.playerScore });
    }

    playRound() {
        this.roundActive = false;

        const ai = this.randomAI();
        const result = this.compare(this.playerGesture, ai);

        if (result === "You win") {
            this.playerScore++;
            this.onPlayerScoreChange(this.playerScore);
        } else if (result === "You lose") {
            this.computerScore++;
            this.onComputerScoreChange(this.computerScore);
        }

        this.resultText.setText(
            `You: ${this.playerGesture}\nAI: ${ai}\n${result}`
        );

        // Check if game should end
        if (this.playerScore >= this.MAX_SCORE) {
            return this.endGame();
        }
        if (this.computerScore >= this.MAX_SCORE) {
            return this.endGame();
        }

        // Otherwise start next round
        this.time.delayedCall(1500, () => this.startRound());
    }

    randomAI() {
        return ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
    }

    compare(p, a) {
        if (p === a) return "Tie";
        const win =
            (p === "rock" && a === "scissors") ||
            (p === "paper" && a === "rock") ||
            (p === "scissors" && a === "paper");
        return win ? "You win" : "You lose";
    }
}
