const request = require("supertest");
const app = require("../../../../../app");
const User = require("../../models/User");

describe("POST /api/register", () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  it("should register a new user", async () => {
    const response = await request(app).post("/api/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe2@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");
  });

  it("should return 400 if email already exists", async () => {
    await request(app).post("/api/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe2@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    const response = await request(app).post("/api/register").send({
      first_name: "Jane",
      last_name: "Doe",
      email: "johndoe2@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Email already exists");
  });
});
