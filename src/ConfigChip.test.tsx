import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { ConfigChip, formatConfigSummary, type ConfigSummaryParts } from "./ConfigChip";

afterEach(cleanup);

const BASE: ConfigSummaryParts = {
  width: 1920,
  height: 1080,
  screenshotFilename: "screenshot.png",
  downloadShaderFilename: "fragment.frag",
  autoRun: false,
  customTexture: false,
  savedCount: 0,
};

describe("formatConfigSummary", () => {
  it("summarizes the hidden output config", () => {
    expect(formatConfigSummary(BASE)).toBe("1920×1080 · screenshot.png · fragment.frag");
  });

  it("adds flags for non-default hidden state", () => {
    expect(
      formatConfigSummary({ ...BASE, autoRun: true, customTexture: true, savedCount: 2 })
    ).toBe(
      "1920×1080 · screenshot.png · fragment.frag · auto-run · custom texture · 2 saved"
    );
  });
});

describe("ConfigChip", () => {
  it("renders the summary and opens the config sheet", () => {
    const onClick = vi.fn();
    render(<ConfigChip {...BASE} onClick={onClick} />);
    expect(screen.getByText("1920×1080 · screenshot.png · fragment.frag")).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
