const request = require("supertest");
const app = require("../../../../../app");

describe("POST /api/register", () => {
  it("should register a new user", async () => {
    const response = await request(app).post("/api/register").send({
      first_name: "John", // Valid first name
      last_name: "Doe", // Valid last name
      email: "johndoe2@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    console.log(response.body); // Log the response body to see what is returned
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");
  });
  it("should return 400 if email already exists", async () => {
    const response = await request(app).post("/api/register").send({
      first_name: "John2",
      last_name: "Doe2",
      email: "johndoe2@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Email already exists");
  });
});
