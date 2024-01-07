import request from "supertest";

import app from "../src/app";

describe("GET /api/v1", () => {
  it("responds with a json message", (done) => {
    request(app).get("/api/v1").set("Accept", "application/json").expect("Content-Type", /json/).expect(
      200,
      {
        message: "API - 👋🌎🌍🌏",
      },
      done
    );
  });
});

describe("GET /api/v1/emojis", () => {
  it("responds with a json message", (done) => {
    request(app)
      .get("/api/v1/emojis")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, ["😀", "😳", "🙄"], done);
  });
});

describe("GET /api/v1/users", () => {
  it("responds with an empty array or an array of users if users exist", async () => {
    const response = await request(app).get("/api/v1/users");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const user = response.body[0];

      expect(user).toHaveProperty("id");
      expect(user.id).toEqual(expect.any(Number));
      expect(user).toHaveProperty("name", expect.any(String));
      expect(user).toHaveProperty("email", expect.any(String));
    } else {
      expect(response.body).toEqual([]);
    }
  });
});
