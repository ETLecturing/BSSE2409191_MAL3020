import request from "supertest";
import { expect } from "chai";
import app from "../../src/index.js";

describe("Login API", () => {
  it("returns 400 when missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "" });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.exist;
  });
});
