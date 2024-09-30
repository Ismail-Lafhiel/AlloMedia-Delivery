const request = require("supertest");
const app = require("../../../../../app");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const { logoutUser } = require("../auth/logoutController");
const { addToBlacklist } = require("../../utils/tokenBlacklist");
const { verifyToken } = require("../../helpers/authHelper");


describe("POST /api/logout", () => {
  let addToBlacklistStub;
  let verifyTokenStub;

  beforeEach(() => {
    addToBlacklistStub = sinon.stub(addToBlacklist);
    verifyTokenStub = sinon.stub(verifyToken);
  });

  afterEach(() => {
    sinon.restore();
  });

  test("should return 401 if no token is provided", async () => {
    const res = await request(app).post("/logout");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("No token provided.");
  });

  test("should return 401 if the token is invalid", async () => {
    verifyTokenStub.returns({ valid: false, message: "Invalid token." });

    const res = await request(app)
      .post("/logout")
      .set("Authorization", `Bearer invalidtoken`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token.");
  });

  test("should successfully log out and add token to the blacklist", async () => {
    verifyTokenStub.returns({ valid: true });
    addToBlacklistStub.returns();

    const validToken = jwt.sign({ id: "user123" }, process.env.JWT_SECRET);

    const res = await request(app)
      .post("/logout")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logout successful");

    // Assert that the token was added to the blacklist
    sinon.assert.calledOnce(addToBlacklistStub);

    // Assert that the cookie was cleared
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("should handle server errors", async () => {
    verifyTokenStub.throws(new Error("Some server error"));

    const res = await request(app)
      .post("/logout")
      .set("Authorization", `Bearer validtoken`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error during logout.");
  });
});
