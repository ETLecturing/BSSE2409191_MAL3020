import { expect } from "chai";

function add(a, b) {
  return a + b;
}

describe("ADD FUNCTION TEST", () => {
  it("should return 5 when 2 + 3", () => {
    expect(add(2, 3)).to.equal(5);
  });

  it("should return 10 when 5 + 5", () => {
    expect(add(5, 5)).to.equal(10);
  });
});
