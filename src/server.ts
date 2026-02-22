import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 9999;

config();
connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server runnig on port: ${PORT}`);
});

// Handle unhandled promise rejetions (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception", err);
  await disconnectDB();
  process.exit(1);
});

// Gracefull shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});
