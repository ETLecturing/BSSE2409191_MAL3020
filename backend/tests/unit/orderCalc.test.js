import { expect } from "chai";

function calculateTotal(subtotal, serviceCharge) {
  return subtotal + serviceCharge;
}

describe("Order Calculation Unit Tests", () => {
  it("should return correct total", () => {
    expect(calculateTotal(10, 0.6)).to.equal(10.6);
  });

  it("should handle zero service charge", () => {
    expect(calculateTotal(20, 0)).to.equal(20);
  });

  it("should fail on invalid negative values", () => {
    expect(() => calculateTotal(-5, 2)).to.throw;
  });
});
