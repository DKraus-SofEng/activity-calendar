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

console.log("PORT:", PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "set" : "NOT SET");

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
