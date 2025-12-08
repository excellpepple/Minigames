process.env.NODE_ENV = "test";

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../../mongoBackend.js";
import PlayerStats from "../PlayerStats.js";

let mongo;

// ------------------------------
// Setup + Teardown
// ------------------------------
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

beforeEach(async () => {
  await PlayerStats.deleteMany({});
});

// ------------------------------
// POST /updatePlayerScore Tests
// ------------------------------
describe("POST /updatePlayerScore", () => {

  it("creates new stats if none exist", async () => {
    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "game1",
        playerId: "player1",
        newScore: 100
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("New stats created");
    expect(res.body.stats.highScore).toBe(100);
    expect(res.body.stats.totalScore).toBe(100);
  });

  it("updates score if stats already exist", async () => {
    await PlayerStats.create({
      gameId: "game2",
      playerId: "player2",
      highScore: 50,
      totalScore: 75
    });

    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "game2",
        playerId: "player2",
        newScore: 40
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Score updated");
    expect(res.body.stats.highScore).toBe(50); // unchanged
    expect(res.body.stats.totalScore).toBe(115); // 75 + 40
  });

  it("updates high score when newScore is higher", async () => {
    await PlayerStats.create({
      gameId: "game3",
      playerId: "player3",
      highScore: 80,
      totalScore: 200
    });

    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "game3",
        playerId: "player3",
        newScore: 120
      });

    expect(res.status).toBe(200);
    expect(res.body.stats.highScore).toBe(120);
    expect(res.body.stats.totalScore).toBe(320); // 200 + 120
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "game4",
        newScore: 50
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Missing fields");
  });

  it("returns 400 when newScore is not a number", async () => {
    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "game5",
        playerId: "player5",
        newScore: "ABC"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Missing fields");
  });

});
