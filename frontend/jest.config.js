export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testMatch: ["**/models/PlayerStatsTest/*.test.js"],
  verbose: true
};
