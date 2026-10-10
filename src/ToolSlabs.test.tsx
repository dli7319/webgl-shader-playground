import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import {
  ToolSlabs,
  type SlabId,
  type SlabStateInfo,
  type ToolSlabsProps,
} from "./ToolSlabs";
import { ControlRail } from "./ControlRail";
import type { SavedShader } from "./shaderStore";

afterEach(cleanup);

const INFO: SlabStateInfo = {
  width: 1920,
  height: 1080,
  screenshotFilename: "screenshot.png",
  isRecording: false,
  downloadShaderFilename: "fragment.frag",
  savedCount: 0,
  textureLabel: "cat-7738210_1920.jpg",
};

const CLOSED: Record<SlabId, boolean> = {
  capture: false,
  file: false,
  history: false,
  texture: false,
};

function slabProps(overrides: Partial<ToolSlabsProps> = {}): ToolSlabsProps {
  return {
    openSlabs: { ...CLOSED },
    info: INFO,
    width: 1920,
    height: 1080,
    onWidthChange: () => {},
    onHeightChange: () => {},
    screenshotFilename: "screenshot.png",
    onScreenshotFilenameChange: () => {},
    onCaptureScreenshot: () => {},
    recordingSupported: true,
    isRecording: false,
    onToggleRecording: () => {},
    downloadShaderFilename: "fragment.frag",
    onDownloadShaderFilenameChange: () => {},
    onDownloadShader: () => {},
    onResetShader: () => {},
    entries: [],
    onSaveShader: () => {},
    onRemoveShader: () => {},
    onApplyShader: () => {},
    onPickImage: () => {},
    ...overrides,
  };
}

function openOne(id: SlabId): ToolSlabsProps {
  return slabProps({ openSlabs: { ...CLOSED, [id]: true } });
}

describe("collapsed tool slabs", () => {
  it("reports each slab's state and hides its controls", () => {
    const { container } = render(<ToolSlabs {...slabProps()} />);
    // State stamps appear on the slab bars (and again in the rail brackets
    // when the full app is assembled).
    expect(screen.getAllByText(/1920×1080 · screenshot\.png/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fragment\.frag/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Empty/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cat-7738210_1920\.jpg/).length).toBeGreaterThan(0);
    // Every slab body is disclosed (hidden) until its bracket opens it.
    for (const id of ["capture", "file", "history", "texture"]) {
      expect(
        container.querySelector(`#slab-${id}-panel`)?.hasAttribute("hidden")
      ).toBe(true);
    }
    // Nothing is reachable without opening a slab.
    expect(screen.queryByRole("button", { name: "Screenshot!" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Download Shader (Ctrl+S)" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save shader" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Record (WebM)" })).toBeNull();
  });

  it("shows the saved count when history has entries", () => {
    render(<ToolSlabs {...slabProps({ info: { ...INFO, savedCount: 3 } })} />);
    expect(screen.getAllByText(/3 saved/).length).toBeGreaterThan(0);
  });
});

describe("capture slab", () => {
  it("keeps export size + filename + screenshot as one group", () => {
    render(<ToolSlabs {...openOne("capture")} />);
    expect(screen.getByLabelText("Width")).toBeTruthy();
    expect(screen.getByLabelText("Height")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Record (WebM)" })).toBeTruthy();
  });

  it("swaps the recording flag in place when recording", () => {
    render(
      <ToolSlabs
        {...slabProps({
          openSlabs: { ...CLOSED, capture: true },
          isRecording: true,
          info: { ...INFO, isRecording: true },
        })}
      />
    );
    expect(screen.getByRole("button", { name: "Stop recording" })).toBeTruthy();
    // The flag swaps in place on the slab bar.
    expect(screen.getAllByText("● REC")).toHaveLength(1);
  });
});

describe("source file slab", () => {
  it("keeps filename + download + reset together", () => {
    render(<ToolSlabs {...openOne("file")} />);
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download Shader (Ctrl+S)" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset to default shader" })).toBeTruthy();
  });
});

describe("saved shaders slab", () => {
  it("keeps the save affordance as the neutral empty state", () => {
    render(<ToolSlabs {...openOne("history")} />);
    expect(screen.getByRole("button", { name: "Save shader" })).toBeTruthy();
    expect(screen.getByText("No saved shaders yet.")).toBeTruthy();
  });

  it("lists entries with load and delete", () => {
    const entries: SavedShader[] = [
      { id: "shader-1", name: "waves", source: "void main() {}", savedAt: 1 },
    ];
    render(<ToolSlabs {...openOne("history")} entries={entries} />);
    expect(screen.getByText("waves")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Load" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });
});

describe("texture slab", () => {
  it("keeps the texture pick reachable", () => {
    render(<ToolSlabs {...openOne("texture")} />);
    expect(screen.getByText("Pick tDiffuse Image")).toBeTruthy();
    expect(screen.getByLabelText("Choose a texture image")).toBeTruthy();
  });
});

describe("control rail disclosure", () => {
  function Harness() {
    const [openSlabs, setOpenSlabs] = React.useState<Record<SlabId, boolean>>({
      ...CLOSED,
    });
    return (
      <>
        <ToolSlabs {...slabProps({ openSlabs })} />
        <ControlRail
          autoRun={false}
          onToggleAutoRun={() => {}}
          onRunShader={() => {}}
          openSlabs={openSlabs}
          onToggleSlab={(id) =>
            setOpenSlabs((slabs) => ({ ...slabs, [id]: !slabs[id] }))
          }
          info={INFO}
        />
      </>
    );
  }

  it("opens and closes a slab from its bracketed summary", () => {
    render(<Harness />);
    const bracket = screen.getByRole("button", {
      name: "[ Capture · 1920×1080 · screenshot.png ]",
    });
    expect(bracket.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: "Screenshot!" })).toBeNull();

    fireEvent.click(bracket);
    expect(bracket.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();

    fireEvent.click(bracket);
    expect(bracket.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: "Screenshot!" })).toBeNull();
  });

  it("carries exactly one filled action: Run Shader", () => {
    const { container } = render(<Harness />);
    const filled = container.querySelectorAll("button.btn-primary");
    expect(filled).toHaveLength(1);
    expect(filled[0].textContent).toContain("Run Shader (Ctrl+Enter)");
  });
});
