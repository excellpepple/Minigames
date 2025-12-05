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
    constructor() {
        super("MainScene")
        this.playerGesture = null
        this.roundActive = false
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

    playRound() {
        this.roundActive = false

        const ai = this.randomAI()
        const result = this.compare(this.playerGesture, ai)

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
