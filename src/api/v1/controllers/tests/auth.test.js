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
  jest.setTimeout(30000);
  let tempConfirmationCode;

  beforeEach(async () => {
    // Cleaning up database before each test
    await User.deleteMany({});

    // Generating a temporary confirmation code for password reset
    tempConfirmationCode = generate2FACode();
  });

  // Test for user registration
  describe("User Registration", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/register").send({
        first_name: "John",
        last_name: "Doe",
        email: "john.new@example.com",
        password: "password123",
        confirmPassword: "password123",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("message");
    });

    it("should return an error if email already exists", async () => {
      // Creating a user
      await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: true,
      });

      // Try registering with the same email
      const res = await request(app).post("/api/register").send({
        first_name: "Jane",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: "password456",
        confirmPassword: "password456",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });
  });

  // Test for email confirmation
  describe("Email Confirmation", () => {
    it("should confirm user email successfully", async () => {
      // Creating a user
      const user = await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: false,
      });

      const token = generateToken(user); // Ensuring this token is valid

      const res = await request(app).post("/api/confirm-email").send({ token });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Email confirmed successfully");
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
      // Creating a user
      const user = await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: true,
      });

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
      await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: false,
      });

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
      const user = await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: true,
      });

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
      await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: true,
      });

      const res = await request(app)
        .post("/api/request-password-reset")
        .send({ email: "john.doe@example.com" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe(
        "Password reset email sent. Please check your email for the confirmation code."
      );
    });

    it("should reset the password successfully", async () => {
      const user = await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: true,
        resetConfirmationCode: tempConfirmationCode, // Storing the temp confirmation code
        resetCodeExpires: Date.now() + 10 * 60 * 1000, // Valid only for 10 minutes
      });

      const token = generateResetToken(user);

      const res = await request(app).post("/api/reset-password").send({
        token,
        newPassword: "newpassword123",
        confirmationCode: tempConfirmationCode, // Using the correct confirmation code
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Password reset successfully");
    });

    it("should return an error if confirmation code is invalid", async () => {
      const user = await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: true,
        resetConfirmationCode: tempConfirmationCode, // Storing the temp confirmation code
        resetCodeExpires: Date.now() + 10 * 60 * 1000, // Valid ony for 10 minutes
      });

      const token = generateResetToken(user);

      const res = await request(app).post("/api/reset-password").send({
        token,
        newPassword: "newpassword123",
        confirmationCode: "wrongcode", // Sending an incorrect confirmation code
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid confirmation code");
    });

    it("should return an error if confirmation code has expired", async () => {
      const user = await User.create({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        password: await hashPassword("password123"),
        emailConfirmed: true,
        resetConfirmationCode: tempConfirmationCode, // Storing the temp confirmation code
        resetCodeExpires: Date.now() - 10 * 60 * 1000, // Expired
      });

      const token = generateResetToken(user);

      const res = await request(app).post("/api/reset-password").send({
        token,
        newPassword: "newpassword123",
        confirmationCode: tempConfirmationCode, // Using the correct confirmation code
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Confirmation code has expired");
    });
  });
});
