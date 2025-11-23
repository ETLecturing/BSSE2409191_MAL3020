import { expect } from "chai";
import bcrypt from "bcryptjs";

describe("Auth Unit Test", () => {
  it("should validate correct password", async () => {
    const hash = await bcrypt.hash("123456", 10);
    const match = await bcrypt.compare("123456", hash);
    expect(match).to.equal(true);
  });

  it("should reject wrong password", async () => {
    const hash = await bcrypt.hash("123456", 10);
    const match = await bcrypt.compare("wrong", hash);
    expect(match).to.equal(false);
  });
});
