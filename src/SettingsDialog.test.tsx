import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { SettingsDialog } from "./SettingsDialog";
import { createShaderStore, type ShaderStore } from "./shaderStore";
import { DEFAULT_SETTINGS } from "./settings";

afterEach(cleanup);

function memoryStorage(): Pick<Storage, "getItem" | "setItem"> {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

function renderSheet(overrides: Partial<React.ComponentProps<typeof SettingsDialog>> = {}) {
  const store: ShaderStore = createShaderStore(memoryStorage());
  const props: React.ComponentProps<typeof SettingsDialog> = {
    settings: DEFAULT_SETTINGS,
    onChange: vi.fn(),
    onClose: vi.fn(),
    width: 1920,
    height: 1080,
    onWidthChange: vi.fn(),
    onHeightChange: vi.fn(),
    screenshotFilename: "screenshot.png",
    onScreenshotFilenameChange: vi.fn(),
    onCaptureScreenshot: vi.fn(),
    downloadShaderFilename: "fragment.frag",
    onDownloadShaderFilenameChange: vi.fn(),
    onDownloadShader: vi.fn(),
    onPickImage: vi.fn(),
    shaderStore: store,
    currentSource: "void main() {}",
    onApplySource: vi.fn(),
    onResetShader: vi.fn(),
    ...overrides,
  };
  return { ...render(<SettingsDialog {...props} />), props };
}

describe("SettingsDialog config sheet", () => {
  it("is the labeled settings dialog", () => {
    renderSheet();
    expect(screen.getByRole("dialog", { name: "Settings" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("keeps the screenshot group together (size + filename + action)", () => {
    renderSheet();
    expect(screen.getByLabelText("Screenshot width in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot height in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
  });

  it("keeps the shader download group together", () => {
    renderSheet();
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download Shader (Ctrl+S)" })).toBeTruthy();
  });

  it("offers the texture pick and saved-shader group", () => {
    renderSheet();
    expect(screen.getByLabelText("Choose a texture image")).toBeTruthy();
    expect(screen.getByText("Pick tDiffuse Image")).toBeTruthy();
    expect(screen.getByLabelText("Shader save name")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save shader" })).toBeTruthy();
  });

  it("shows a neutral history empty state with the save affordance", () => {
    renderSheet();
    expect(screen.getByText("No saved shaders yet.")).toBeTruthy();
  });

  it("lists saved shaders with load and delete actions", () => {
    const store = createShaderStore(memoryStorage());
    store.save("nebula", "void main() {}");
    renderSheet({ shaderStore: store });
    expect(screen.getByText("nebula")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Load" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  it("holds the editor preferences and theme picker", () => {
    const { props } = renderSheet();
    expect(screen.getByLabelText("Editor font size")).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Word wrap" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Auto-run while typing" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(props.onChange).toHaveBeenCalledWith({ themeMode: "dark" });
  });

  it("keeps the destructive reset action", () => {
    const { props } = renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "Reset to default shader" }));
    expect(props.onResetShader).toHaveBeenCalledTimes(1);
  });
});
