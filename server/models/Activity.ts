import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  name: string;
  details: string;
  date: Date;
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
  name: { type: String, required: true },
  details: { type: String, required: true },
  date: { type: Date, required: true },
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
  tags: [{ type: String, required: false }],
});

const Activity = mongoose.model<IActivity>("Activity", activitySchema);

export default Activity;
