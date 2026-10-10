import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { CommandRow } from "./CommandRow";

afterEach(cleanup);

function renderRow(overrides: Partial<Parameters<typeof CommandRow>[0]> = {}) {
  return render(
    <CommandRow
      onRunShader={() => {}}
      onUndo={() => {}}
      onRedo={() => {}}
      canUndo={true}
      canRedo={false}
      configOpen={false}
      onToggleConfig={() => {}}
      configSummary="1920×1080 · screenshot.png · fragment.frag"
      archiveOpen={false}
      onToggleArchive={() => {}}
      archiveSummary="2 saved"
      {...overrides}
    />
  );
}

describe("CommandRow", () => {
  it("renders the command keys with their exact labels", () => {
    renderRow();
    expect(screen.getByRole("button", { name: "Run Shader (Ctrl+Enter)" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Redo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Config" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Archive" })).toBeTruthy();
    expect((screen.getByRole("button", { name: "Redo" }) as HTMLButtonElement).disabled).toBe(
      true
    );
  });

  it("reports the hidden groups' state beside their toggles", () => {
    renderRow();
    expect(screen.getByText("1920×1080 · screenshot.png · fragment.frag")).toBeTruthy();
    expect(screen.getByText("2 saved")).toBeTruthy();
  });

  it("exposes disclosure state via aria-expanded", () => {
    renderRow({ configOpen: true, onToggleConfig: vi.fn() });
    expect(
      screen.getByRole("button", { name: "Config" }).getAttribute("aria-expanded")
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "Archive" }).getAttribute("aria-expanded")
    ).toBe("false");
  });

  it("wires run, undo, and the drawer toggles", () => {
    const onRunShader = vi.fn();
    const onUndo = vi.fn();
    const onToggleConfig = vi.fn();
    renderRow({ onRunShader, onUndo, onToggleConfig });
    fireEvent.click(screen.getByRole("button", { name: "Run Shader (Ctrl+Enter)" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Config" }));
    expect(onRunShader).toHaveBeenCalledTimes(1);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onToggleConfig).toHaveBeenCalledTimes(1);
  });
});
