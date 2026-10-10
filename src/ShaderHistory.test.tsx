import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { ShaderHistory } from "./ShaderHistory";
import { createShaderStore, type SavedShader } from "./shaderStore";

afterEach(cleanup);

function fakeStorage(initial: SavedShader[] = []) {
  const map = new Map<string, string>();
  if (initial.length > 0) {
    map.set("shader-playground:shaders", JSON.stringify(initial));
  }
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("ShaderHistory (ARCHIVE drawer)", () => {
  it("keeps the empty state neutral with a direct save affordance", () => {
    render(
      <ShaderHistory
        store={createShaderStore(fakeStorage())}
        currentSource="void main() {}"
        onApply={() => {}}
      />
    );
    expect(screen.getByText("No saved shaders yet.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save shader" })).toBeTruthy();
  });

  it("saves a named shader and lists it with load/delete", () => {
    render(
      <ShaderHistory
        store={createShaderStore(fakeStorage())}
        currentSource="void main() {}"
        onApply={() => {}}
      />
    );
    fireEvent.input(screen.getByLabelText("Shader save name"), {
      target: { value: "plasma" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save shader" }));
    expect(screen.getByText("plasma")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Load" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  it("applies and deletes entries", () => {
    const onApply = vi.fn();
    render(
      <ShaderHistory
        store={createShaderStore(fakeStorage())}
        currentSource="void main() {}"
        onApply={onApply}
      />
    );
    fireEvent.input(screen.getByLabelText("Shader save name"), {
      target: { value: "plasma" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save shader" }));
    fireEvent.click(screen.getByRole("button", { name: "Load" }));
    expect(onApply).toHaveBeenCalledWith("void main() {}");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByText("plasma")).toBeNull();
    expect(screen.getByText("No saved shaders yet.")).toBeTruthy();
  });
});
