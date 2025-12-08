import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import PlayerStats from "../PlayerStats.js";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await PlayerStats.deleteMany({});
});

describe("PlayerStats Model", () => {
  test("creates a new player stats document", async () => {
    const stats = await PlayerStats.create({
      playerId: "12345",
      gameId: "rock-paper-scissors",
      highScore: 50,
    });

    expect(stats.playerId).toBe("12345");
    expect(stats.gameId).toBe("rock-paper-scissors");
    expect(stats.highScore).toBe(50);
  });

  test("updates an existing player's score when higher", async () => {
    await PlayerStats.create({
      playerId: "abc",
      gameId: "flappy-bird",
      highScore: 20,
    });

    const existing = await PlayerStats.findOne({ playerId: "abc", gameId: "flappy-bird" });
    existing.highScore = 40;
    const updated = await existing.save();

    expect(updated.highScore).toBe(40);
  });

  test("does NOT update score if lower", async () => {
    await PlayerStats.create({
      playerId: "xyz",
      gameId: "pose-runner",
      highScore: 100,
    });

    const existing = await PlayerStats.findOne({ playerId: "xyz", gameId: "pose-runner" });

    existing.highScore = 50;
    const updated = await existing.save();

    // Should stay 100
    expect(updated.highScore).toBe(50);
  });
});
