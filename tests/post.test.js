// feelio/backend/tests/post.test.js
const request = require("supertest");
const app = require("../server");
const Post = require("../models/Post");
const User = require("../models/User");

describe("Post Endpoints", () => {
  let authToken;

  beforeAll(async () => {
    await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    authToken = res.body.token;
  });

  test("Create post with authentication", async () => {
    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Test Post", content: "Test Content" });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.post.title).toBe("Test Post");
  });
});
