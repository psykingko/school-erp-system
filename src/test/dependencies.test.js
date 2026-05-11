import { describe, it, expect } from "vitest";

describe("Dependencies", () => {
  it("should import React", async () => {
    const React = await import("react");
    expect(React).toBeDefined();
    expect(React.default).toBeDefined();
  });

  it("should import Framer Motion", async () => {
    const { motion } = await import("framer-motion");
    expect(motion).toBeDefined();
  });

  it("should import Lucide React", async () => {
    const { Home } = await import("lucide-react");
    expect(Home).toBeDefined();
  });

  it("should import fast-check", async () => {
    const fc = await import("fast-check");
    expect(fc.default).toBeDefined();
  });

  it("should import React Testing Library", async () => {
    const { render } = await import("@testing-library/react");
    expect(render).toBeDefined();
  });
});
