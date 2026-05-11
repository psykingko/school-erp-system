import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the welcome message", () => {
    render(<App />);
    expect(screen.getByText("College ERP Dashboard")).toBeInTheDocument();
  });

  it("shows setup complete message", () => {
    render(<App />);
    expect(screen.getByText("Setup Complete!")).toBeInTheDocument();
  });
});
