import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { TextureControls } from "./TextureControls";

afterEach(cleanup);

describe("TextureControls state chip and sheet", () => {
  it("reports the bound texture beside the opener", () => {
    render(<TextureControls onPickImage={() => {}} />);
    const chip = screen.getByRole("button", { name: /texture/i });
    expect(chip.textContent).toContain("Default texture");
  });

  it("discloses the texture picker without touching the chip", () => {
    render(<TextureControls onPickImage={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /texture/i }));
    expect(screen.getByText(/pick tdiffuse image/i)).toBeTruthy();
    expect(screen.getByLabelText("Choose a texture image")).toBeTruthy();
  });

  it("reports the picked file name after a selection", async () => {
    const onPickImage = vi.fn<(dataUrl: string) => void>();
    render(<TextureControls onPickImage={onPickImage} />);
    fireEvent.click(screen.getByRole("button", { name: /texture/i }));
    const input = screen.getByLabelText("Choose a texture image");
    const file = new File(["fake"], "noise.png", { type: "image/png" });
    // jsdom keeps `files` a readonly FileList — shadow it on the instance.
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    // fireEvent.change never reaches the node once `files` is shadowed, so
    // dispatch the change event directly.
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /texture/i }).textContent).toContain(
        "noise.png"
      );
    });
  });
});
