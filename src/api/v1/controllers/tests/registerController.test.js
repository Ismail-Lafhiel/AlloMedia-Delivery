const request = require("supertest");
const app = require("../../../../../app");
const User = require("../../models/User");
const { sendConfirmationEmail } = require("../../services/emailService");

jest.mock("../../services/emailService"); // Mocking the email service

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
    expect(response.body).toHaveProperty(
      "message",
      "User registered successfully, please confirm your email."
    );
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

  it("should return 400 if passwords do not match", async () => {
    const response = await request(app).post("/api/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe3@example.com",
      password: "password123",
      confirmPassword: "password456",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0]).toHaveProperty(
      "msg",
      "Confirm password does not match password"
    );
  });

  it("should return 400 if any required field is missing", async () => {
    // Missing first name
    let response = await request(app).post("/api/register").send({
      last_name: "Doe",
      email: "johndoe@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0]).toHaveProperty(
      "msg",
      "First name is required"
    );

    // Missing last name
    response = await request(app).post("/api/register").send({
      first_name: "John",
      email: "johndoe@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0]).toHaveProperty(
      "msg",
      "Last name is required"
    );
  });
});
