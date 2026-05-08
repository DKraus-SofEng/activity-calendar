import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import Activity from "../models/Activity";

describe("Activities API", () => {
  afterEach(async () => {
    // Delete all test activities with a known title
    await Activity.deleteMany({ title: /Test Activity|To Update|To Delete/ });
  });

  it("GET /api/activities should return 200 and an array", async () => {
    const res = await request(app).get("/api/activities");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/activities should create a new activity", async () => {
    const newActivity = {
      title: "Test Activity",
      details: "This is a test activity.",
      date: "2026-04-16T12:00:00.000Z",
      startTime: "10:00",
      endTime: "11:00",
    };
    const res = await request(app)
      .post("/api/activities")
      .send(newActivity)
      .set("Accept", "application/json");
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe(newActivity.title);
  });

  it("PUT /api/activities/:id should update an activity", async () => {
    // First, create an activity
    const newActivity = {
      title: "To Update",
      details: "Update me.",
      date: "2026-04-16T12:00:00.000Z",
      startTime: "10:00",
      endTime: "11:00",
    };
    const createRes = await request(app)
      .post("/api/activities")
      .send(newActivity)
      .set("Accept", "application/json");
    const id = createRes.body._id;
    // Now, update it
    const updated = { ...newActivity, title: "Updated Title" };
    const updateRes = await request(app)
      .put(`/api/activities/${id}`)
      .send(updated)
      .set("Accept", "application/json");
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.title).toBe("Updated Title");
  });

  it("DELETE /api/activities/:id should delete an activity", async () => {
    // First, create an activity
    const newActivity = {
      title: "To Delete",
      details: "Delete me.",
      date: "2026-04-16T12:00:00.000Z",
      startTime: "10:00",
      endTime: "11:00",
    };
    const createRes = await request(app)
      .post("/api/activities")
      .send(newActivity)
      .set("Accept", "application/json");
    const id = createRes.body._id;
    // Now, delete it
    const deleteRes = await request(app).delete(`/api/activities/${id}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty("message", "Activity deleted");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
