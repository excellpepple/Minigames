// MainScene.js
import Phaser from "phaser"
import { GestureDetected } from "../../../gesture/gesture.js"
const GESTURE_MAP = {
    "fist": "rock",
    "palm": "paper",
    "peace": "scissors",
    "peace inverted": "scissors",
    "peace_inverted": "scissors"
}


export default class MainScene extends Phaser.Scene {
    constructor({ onPlayerScoreChange, onComputerScoreChange } = {}) {
        super("MainScene")
        this.playerGesture = null
        this.roundActive = false
        this.onPlayerScoreChange = onPlayerScoreChange || (() => {})
        this.onComputerScoreChange = onComputerScoreChange || (() => {})
        this.playerScore = 0
        this.computerScore = 0
    }

    create() {
        this.gesture = new GestureDetected(this)
        this.gesture.start()

        this.resultText = this.add.text(150, 120, "Show gesture", { fontSize: 28 })

        // Listen for gesture changes
        this.gesture.on("gesture-changed", g => {
            if (!this.roundActive) return

            const mapped = GESTURE_MAP[g]
            if (!mapped) return

            this.playerGesture = mapped
            this.playRound()
        })


        this.startRound()
    }

    startRound() {
        this.roundActive = true
        this.playerGesture = null
        this.resultText.setText("Show gesture")
    }

    resetScores() {
        this.playerScore = 0
        this.computerScore = 0
        // Notify React that scores are reset
        this.onPlayerScoreChange(0)
        this.onComputerScoreChange(0)
    }

    playRound() {
        this.roundActive = false

        const ai = this.randomAI()
        const result = this.compare(this.playerGesture, ai)

        // Update scores based on result
        if (result === "You win") {
            this.playerScore++
            if (this.onPlayerScoreChange) {
                this.onPlayerScoreChange(this.playerScore)
            }
        } else if (result === "You lose") {
            this.computerScore++
            if (this.onComputerScoreChange) {
                this.onComputerScoreChange(this.computerScore)
            }
        }

        this.resultText.setText(
            `You: ${this.playerGesture}\nAI: ${ai}\n${result}`
        )

        this.time.delayedCall(1500, () => this.startRound())
    }

    randomAI() {
        const arr = ["rock", "paper", "scissors"]
        return arr[Math.floor(Math.random() * arr.length)]
    }

    compare(p, a) {
        if (p === a) return "Tie"

        const win =
            (p === "rock" && a === "scissors") ||
            (p === "paper" && a === "rock") ||
            (p === "scissors" && a === "paper")

        return win ? "You win" : "You lose"
    }
}
