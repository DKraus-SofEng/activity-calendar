import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import activitiesRouter from "./routes/activities";

console.log("=== server.js starting ===");
try {
  dotenv.config();
  console.log("Dotenv configured");

  // Global error handlers for debugging on Render
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());

  app.use("/api/activities", activitiesRouter);

  console.log("PORT:", PORT);
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "set" : "NOT SET");

  console.log("Attempting to connect to MongoDB...");
  const connectPromise = mongoose.connect(process.env.MONGODB_URI as string);

  Promise.race([
    connectPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MongoDB connection timeout")), 10000),
    ),
  ])
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB (or timeout):", error);
      process.exit(1);
    });
} catch (err) {
  console.error("Top-level import or startup error:", err);
  process.exit(1);
}
