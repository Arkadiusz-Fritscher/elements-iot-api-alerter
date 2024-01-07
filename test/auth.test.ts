import request from "supertest";
import app from "../src/app";

const testUser = {
  username: "JestTestUser",
  password: "JestTestPassword",
  email: "JestTestUser@test.mail",
};

// Create a new user
describe("POST /api/v1/signup", () => {
  it("Should create a new user", async () => {
    const response = await request(app).post("/api/v1/signup").send(testUser);

    expect(response.status).toBe(201);
    expect(typeof response.body.id).toBe("number");

    expect(response.body.username).toBe(testUser.username);
    expect(response.body.email).toBe(testUser.email.toLowerCase());

    expect(response.body.token).toBeDefined();
    expect(typeof response.body.token.jwt).toBe("string");
    expect(typeof response.body.token.expiresIn).toBe("number");
    expect(response.body.token.expiresIn).toBeGreaterThan(0);
  });
});

describe("GET /api/v1/auth", () => {
  it("Should return a token if the credentials are correct", async () => {
    const userData = { username: testUser.username, password: testUser.password }; // Annahme: Gültige Testbenutzerdaten

    const response = await request(app).post("/api/v1/auth").send(userData);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it("Should return an error if the credentials are invalid", async () => {
    const invalidUserData = { username: testUser.username, password: "wrongpassword" }; // Annahme: Ungültige Testbenutzerdaten
    const response = await request(app).post("/api/v1/auth").send(invalidUserData);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Ungültige Anmeldeinformationen");
  });
});
