import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/preact";
import { StatusBar } from "./StatusBar";

afterEach(cleanup);

describe("StatusBar (command strip)", () => {
  it("reports the compile status and run duration", () => {
    render(<StatusBar status="compiled" runDurationMs={3.2} />);
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Compiled");
    expect(status.textContent).toContain("3 ms");
  });

  it("reports the error state", () => {
    render(<StatusBar status="error" runDurationMs={null} />);
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Compile error");
    expect(status.textContent).toContain("—");
  });
});
