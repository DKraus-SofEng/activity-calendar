import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  title: string;
  details: string;
  date: Date;
  endDate?: Date; // Added for multi-day support
  startTime: string;
  endTime: string;
  location?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  links?: string[];
  activityType?: "Zoom" | "In-person" | "Other";
  tags?: string[];
}

const activitySchema: Schema = new Schema({
  title: { type: String, required: true },
  details: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date, required: false }, // Added for multi-day support
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: false },
  imageUrl: { type: String, required: false },
  thumbnailUrl: { type: String, required: false },
  links: [{ type: String, required: false }],
  activityType: {
    type: String,
    enum: ["Zoom", "In-person", "Other"],
    default: "Zoom",
    required: false,
  },
  reminders: {
    type: [String],
    default: [],
  },
  tags: [{ type: String, required: false }],
});

// Prevent duplicate events with same title, date, and startTime
activitySchema.index({ title: 1, date: 1, startTime: 1 }, { unique: true });

const Activity = mongoose.model<IActivity>("Activity", activitySchema);

export default Activity;
