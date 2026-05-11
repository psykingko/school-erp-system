import { describe, it, expect } from "vitest";
import fc from "fast-check";

describe("Testing Setup", () => {
  it("should have vitest working", () => {
    expect(true).toBe(true);
  });

  it("should have fast-check working", () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        expect(typeof n).toBe("number");
        return true;
      }),
      { numRuns: 10 },
    );
  });
});
