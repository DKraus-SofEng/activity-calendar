// src/api/activitiesApi.ts

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://activity-calendar.onrender.com/api/activities";

export interface Activity {
  _id?: string;
  title: string;
  details: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  links?: string[];
  activityType?: "Zoom" | "In-person" | "Other";
  tags?: string[];
}

export async function fetchActivities(): Promise<Activity[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}

export async function addActivity(activity: Activity): Promise<Activity> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activity),
  });
  if (!res.ok) throw new Error("Failed to add activity");
  return res.json();
}

export async function updateActivity(
  id: string,
  activity: Activity,
): Promise<Activity> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activity),
  });
  if (!res.ok) throw new Error("Failed to update activity");
  return res.json();
}

export async function deleteActivity(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete activity");
}
