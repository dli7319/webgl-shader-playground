import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { PreviewPane } from "./PreviewPane";

afterEach(cleanup);

function renderPane(overrides: Partial<Parameters<typeof PreviewPane>[0]> = {}) {
  return render(
    <PreviewPane
      canvasRef={{ current: null }}
      width={1920}
      height={1080}
      zoomPercent={100}
      onZoomIn={() => {}}
      onZoomOut={() => {}}
      onZoomFit={() => {}}
      {...overrides}
    />
  );
}

describe("PreviewPane (pane 2: preview)", () => {
  it("renders the preview canvas with its accessible name", () => {
    renderPane();
    expect(screen.getByRole("img", { name: "Shader preview output" })).toBeTruthy();
  });

  it("keeps the zoom cluster one group in the pane header", () => {
    renderPane();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fit" })).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("wires the zoom controls", () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onZoomFit = vi.fn();
    renderPane({ onZoomIn, onZoomOut, onZoomFit });
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Fit" }));
    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onZoomOut).toHaveBeenCalledTimes(1);
    expect(onZoomFit).toHaveBeenCalledTimes(1);
  });

  it("carries no export or error chrome — those moved to the dock", () => {
    renderPane();
    expect(screen.queryByText("Screenshot!")).toBeNull();
    expect(screen.queryByRole("alert", { hidden: false })).toBeNull();
    expect(screen.queryByRole("status", { hidden: false })).toBeNull();
  });
});
