import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/preact";
import { ActionDock, type ActionDockProps } from "./ActionDock";

afterEach(cleanup);

function renderDock(overrides: Partial<ActionDockProps> = {}) {
  return render(
    <ActionDock
      onRunShader={() => {}}
      themeMode="light"
      onToggleTheme={() => {}}
      openSheet={null}
      onToggleSheet={() => {}}
      width={1920}
      height={1080}
      screenshotFilename="screenshot.png"
      downloadShaderFilename="fragment.frag"
      isRecording={false}
      savedCount={3}
      editorFontSize={14}
      wordWrap={false}
      autoRun={true}
      textureLabel="default texture"
      {...overrides}
    />
  );
}

describe("ActionDock", () => {
  it("keeps the single primary action visible without opening anything", () => {
    renderDock();
    const run = screen.getByRole("button", { name: "Run Shader (Ctrl+Enter)" });
    expect(run.className).toContain("btn-contained");
  });

  it("carries the theme toggle", () => {
    renderDock();
    expect(screen.getByRole("button", { name: /^dark theme/i })).toBeTruthy();
  });

  it("reports hidden control state beside each opener", () => {
    renderDock();
    expect(screen.getByText("1920×1080 · screenshot.png")).toBeTruthy();
    expect(screen.getByText("fragment.frag")).toBeTruthy();
    expect(screen.getByText("3 saved")).toBeTruthy();
    expect(screen.getByText("14px · wrap off · auto on")).toBeTruthy();
    expect(screen.getByText("tDiffuse: default texture")).toBeTruthy();
  });

  it("summarizes an empty history", () => {
    renderDock({ savedCount: 0 });
    expect(screen.getByText("No saves")).toBeTruthy();
  });

  it("flags live recording on the export item", () => {
    renderDock({ isRecording: true });
    expect(screen.getByText("REC")).toBeTruthy();
  });

  it("marks the open sheet on its dock item", () => {
    renderDock({ openSheet: "export" });
    const openItem = screen.getByRole("button", { name: /^export/i });
    expect(openItem.getAttribute("aria-expanded")).toBe("true");
  });
});
