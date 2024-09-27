const request = require("supertest");
const app = require("../../../../../app");
const User = require("../../models/User");
const { generateToken } = require("../../helpers/authHelper");

describe("POST /api/confirm-email", () => {
  let user, token;

  beforeAll(async () => {
    // Clean up the users collection before starting tests
    await User.deleteMany({});

    // Create a dummy user for testing
    user = await User.create({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      password: "hashedPassword123",
      isConfirmed: false, // Initially unconfirmed
    });

    // Generate a token for the user
    token = generateToken(user);
  });

  it("should return 400 if no token is provided", async () => {
    const response = await request(app)
      .post("/api/confirm-email")
      .send({ token: "" }); // Empty token

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Token is required");
  });

  it("should return 400 if the token is invalid or user not found", async () => {
    const invalidToken = "someInvalidToken";

    const response = await request(app)
      .post("/api/confirm-email")
      .send({ token: invalidToken });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid or expired token");
  });

  it("should confirm the user's email with a valid token", async () => {
    const response = await request(app)
      .post("/api/confirm-email")
      .send({ token });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "Email confirmed successfully");

    // Check that the user's `isConfirmed` field is set to true in the database
    const confirmedUser = await User.findOne({ email: "johndoe@example.com" });
    expect(confirmedUser.isConfirmed).toBe(true);
  });
});
