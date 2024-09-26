const request = require("supertest");
const app = require("../../../../../app");
const PORT = process.env.TEST_PORT || 3001;

let server;

describe("POST /api/v1/auth/register", () => {
  beforeAll(async () => {
    server = app.listen(PORT);
  });

  afterAll(async () => {
    await server.close();
  });

  it("should register a new user", async () => {
    const response = await request(server).post("/api/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");
  });

  it("should return 400 if email already exists", async () => {
    const response = await request(server).post("/api/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Email already exists");
  });
});
