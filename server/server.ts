import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import activitiesRouter from "./routes/activities";

dotenv.config();

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

const connectPromise = mongoose.connect(process.env.MONGODB_URI as string);

Promise.race([
  connectPromise,
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("MongoDB connection timeout")), 10000),
  ),
])
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB (or timeout):", error);
    process.exit(1);
  });
