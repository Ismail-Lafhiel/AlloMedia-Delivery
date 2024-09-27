const request = require("supertest");
const app = require("../../../../../app");
const User = require("../../models/User");

describe("POST /api/login", () => {
  beforeAll(async () => {
    // Set up a user in the database for login tests
    await request(app).post("/api/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe2@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
  });

  it("should log in an existing user with valid credentials", async () => {
    const response = await request(app).post("/api/login").send({
      email: "johndoe2@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("email", "johndoe2@example.com");
  });

  it("should return 400 for invalid email", async () => {
    const response = await request(app).post("/api/login").send({
      email: "invalid@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should return 400 for invalid password", async () => {
    const response = await request(app).post("/api/login").send({
      email: "johndoe2@example.com",
      password: "wrongpassword",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should return 400 for missing email", async () => {
    const response = await request(app).post("/api/login").send({
      email: "",
      password: "password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });

  it("should return 400 for missing password", async () => {
    const response = await request(app).post("/api/login").send({
      email: "johndoe2@example.com",
      password: "",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Password is required");
  });
});
