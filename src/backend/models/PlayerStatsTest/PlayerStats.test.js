// This file is to test the database routes of PlayerStats.js
// We test both GET and POST routes


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
// GET TESTS
// ------------------------------
describe("GET /playerstats/:gameId/:playerId", () => {
  it("should return player stats when they exist", async () => {
    await PlayerStats.create({
      gameId: "game1",
      playerId: "player1",
      highScore: 50,
      totalScore: 50,
    });

    const res = await request(app).get("/playerstats/game1/player1");

    expect(res.status).toBe(200);
    expect(res.body.gameId).toBe("game1");
    expect(res.body.playerId).toBe("player1");
    expect(res.body.highScore).toBe(50);
  });

  it("should return 404 if stats do not exist", async () => {
    const res = await request(app).get("/playerstats/abc/xyz");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Player stats not found for this game.");

  });
});

// ------------------------------
// POST TESTS for updatePlayerScore
// ------------------------------
describe("POST /updatePlayerScore", () => {

  it("should create new stats if none exist", async () => {
    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "gameA",
        playerId: "playerA",
        newScore: 100,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("New stats created and high score set");
    expect(res.body.stats.highScore).toBe(100);
    expect(res.body.stats.totalScore).toBe(100);
  });

  it("should update high score and increase totalScore when newScore is higher", async () => {
    await PlayerStats.create({
      gameId: "gameB",
      playerId: "playerB",
      highScore: 200,
      totalScore: 300,
    });

    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "gameB",
        playerId: "playerB",
        newScore: 250,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Score processed");
    expect(res.body.stats.highScore).toBe(250);
    expect(res.body.stats.totalScore).toBe(550); // 300 + 250
  });

  it("should NOT update highScore if newScore is lower", async () => {
    await PlayerStats.create({
      gameId: "gameC",
      playerId: "playerC",
      highScore: 300,
      totalScore: 500,
    });

    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "gameC",
        playerId: "playerC",
        newScore: 100,
      });

    expect(res.status).toBe(200);
    expect(res.body.stats.highScore).toBe(300); // unchanged
    expect(res.body.stats.totalScore).toBe(500); // unchanged
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "missing",
        newScore: 50,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("gameId, playerId, and newScore are required");
  });

  it("should return 400 if newScore is not a number", async () => {
    const res = await request(app)
      .post("/updatePlayerScore")
      .send({
        gameId: "gameX",
        playerId: "playerX",
        newScore: "notNumber",
      });

    expect(res.status).toBe(400);
  });

});
