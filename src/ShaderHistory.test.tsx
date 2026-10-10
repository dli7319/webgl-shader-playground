import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { ShaderHistory } from "./ShaderHistory";
import { SHADER_STORE_KEY, type SavedShader } from "./shaderStore";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

function seedSaves(saves: SavedShader[]) {
  window.localStorage.setItem(SHADER_STORE_KEY, JSON.stringify(saves));
}

describe("ShaderHistory state chip and sheet", () => {
  it("reports the save count beside the opener", () => {
    seedSaves([{ id: "shader-1", name: "plasma", source: "void main() {}", savedAt: 1 }]);
    render(
      <ShaderHistory
        currentSource="void main() {}"
        onApply={() => {}}
        onResetShader={() => {}}
      />
    );
    const chip = screen.getByRole("button", { name: /history/i });
    expect(chip.textContent).toContain("1 saved");
  });

  it("opens the sheet with save, load and delete controls", () => {
    seedSaves([{ id: "shader-1", name: "plasma", source: "void main() {}", savedAt: 1 }]);
    render(
      <ShaderHistory
        currentSource="void main() {}"
        onApply={() => {}}
        onResetShader={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /history/i }));
    expect(screen.getByLabelText("Shader save name")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save shader" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Load" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset to default shader" })).toBeTruthy();
  });

  it("keeps the empty state neutral with a direct save affordance", () => {
    render(
      <ShaderHistory
        currentSource="void main() {}"
        onApply={() => {}}
        onResetShader={() => {}}
      />
    );
    const chip = screen.getByRole("button", { name: /history/i });
    expect(chip.textContent).toContain("No saves");
    fireEvent.click(chip);
    expect(screen.getByText("No saved shaders yet.")).toBeTruthy();
    // Save stays disabled until a name is typed.
    expect(
      (screen.getByRole("button", { name: "Save shader" }) as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it("applies a saved shader and restores the default", () => {
    seedSaves([{ id: "shader-1", name: "plasma", source: "saved source", savedAt: 1 }]);
    const onApply = vi.fn<(source: string) => void>();
    const onResetShader = vi.fn<() => void>();
    render(
      <ShaderHistory
        currentSource="void main() {}"
        onApply={onApply}
        onResetShader={onResetShader}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /history/i }));
    fireEvent.click(screen.getByRole("button", { name: "Load" }));
    expect(onApply).toHaveBeenCalledWith("saved source");
    fireEvent.click(screen.getByRole("button", { name: "Reset to default shader" }));
    expect(onResetShader).toHaveBeenCalledTimes(1);
  });
});
