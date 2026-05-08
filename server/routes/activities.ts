import express from "express";
import Activity from "../models/Activity";
import type { IActivity } from "../models/Activity.ts";

const router = express.Router();

// GET all activities
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET one activity by ID
router.get("/:id", async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create a new activity
router.post("/", async (req, res) => {
  try {
    const activity: IActivity = new Activity(req.body);
    await activity.save();
    // Fetch the saved activity to ensure all fields (like defaults, virtuals) are included
    const savedActivity = await Activity.findById(activity._id);
    res.status(201).json(savedActivity);
  } catch (error: any) {
    let details = "Unknown error";
    if (error instanceof Error) {
      details = error.message;
    } else if (typeof error === "object") {
      details = JSON.stringify(error);
    } else if (typeof error === "string") {
      details = error;
    }
    console.error("Error creating activity:", error);
    res.status(400).json({
      error: "Failed to create activity",
      details,
    });
  }
});

// PUT update an activity by ID
router.put("/:id", async (req, res) => {
  try {
    await Activity.findByIdAndUpdate(req.params.id, req.body);
    // Fetch the updated activity to ensure all fields are included
    const updatedActivity = await Activity.findById(req.params.id);
    if (!updatedActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json(updatedActivity);
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(400).json({ error: "Failed to update activity" });
  }
});

// DELETE an activity by ID
router.delete("/:id", async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json({ message: "Activity deleted" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(400).json({ error: "Failed to delete activity" });
  }
});

export default router;
