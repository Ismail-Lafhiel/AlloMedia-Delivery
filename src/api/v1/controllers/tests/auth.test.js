const request = require("supertest");
const app = require("../../../../../app");
const User = require("../../models/User");
const {
  hashPassword,
  generateToken,
  generateResetToken,
} = require("../../helpers/authHelper");
const { generate2FACode } = require("../../helpers/send2FACode");

describe("User Authentication Controllers", () => {
  let tempConfirmationCode;
  let user;

  beforeEach(async () => {
    // Create a test user before each test
    user = await User.create({
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      password: await hashPassword("password123"),
      emailConfirmed: true,
    });

    // Generate a temporary confirmation code for password reset
    tempConfirmationCode = generate2FACode();
  });

  afterEach(async () => {
    await User.deleteMany({}); // Clean up database after each test
  });

  // Test for user registration
  describe("User Registration", () => {
    it("should register a user successfully", async () => {
      const res = await request(app).post("/api/register").send({
        first_name: "Jane",
        last_name: "Doe",
        email: "jane.doe@example.com",
        password: "password123",
        confirmPassword: "password123", // Include this field
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe(
        "User registered successfully, please confirm your email."
      );
    });

    it("should return an error if email already exists", async () => {
      const res = await request(app).post("/api/register").send({
        first_name: "Jane",
        last_name: "Doe",
        email: "john.doe@example.com", // Same email as the test user
        password: "password456",
        confirmPassword: "password456", // Include this field
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });
  });

  // Test for email confirmation
  describe("Email Confirmation", () => {
    it("should confirm user email successfully", async () => {
      const token = generateToken(user); // Ensure this token is valid

      const res = await request(app).post("/api/confirm-email").send({ token });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Email confirmed successfully.");
    });

    it("should return an error if token is missing", async () => {
      const res = await request(app).post("/api/confirm-email").send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Token is required");
    });
  });

  // Test for user login
  describe("User Login", () => {
    it("should log in user successfully", async () => {
      const res = await request(app).post("/api/login").send({
        email: "john.doe@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("User logged in successfully.");
      expect(res.body.token).toBeDefined();
    });

    it("should return an error for invalid credentials", async () => {
      const res = await request(app).post("/api/login").send({
        email: "john.doe@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Invalid credentials.");
    });

    it("should return an error if email is not confirmed", async () => {
      await User.updateOne(
        { email: "john.doe@example.com" },
        { emailConfirmed: false }
      );

      const res = await request(app).post("/api/login").send({
        email: "john.doe@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "Please confirm your email before logging in."
      );
    });
  });

  // Test for user logout
  describe("User Logout", () => {
    it("should log out user successfully", async () => {
      const token = generateToken(user);

      const res = await request(app)
        .post("/api/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Logout successful");
    });

    it("should return an error if no token is provided", async () => {
      const res = await request(app).post("/api/logout");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("No token provided.");
    });
  });

  // Test for password reset request
  describe("Password Reset", () => {
    it("should request password reset successfully", async () => {
      const res = await request(app)
        .post("/api/request-password-reset")
        .send({ email: "john.doe@example.com" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe(
        "Password reset email sent. Please check your email for the confirmation code."
      );
    });

    it("should reset the password successfully", async () => {
      const token = generateResetToken(user); // Ensure this token is valid

      const res = await request(app).post("/api/reset-password").send({
        token,
        newPassword: "newpassword123",
        confirmationCode: tempConfirmationCode,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Password reset successfully");
    });

    it("should return an error if confirmation code is invalid", async () => {
      const token = generateResetToken(user);

      const res = await request(app).post("/api/reset-password").send({
        token,
        newPassword: "newpassword123",
        confirmationCode: "wrongcode",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid confirmation code");
    });
  });
});
