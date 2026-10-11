/**
 * Shadertoy-style multi-pass model: up to four buffer passes feeding the image
 * pass, plus shared "Common" code. Each pass has four iChannels the user wires
 * to nothing, the playground texture, or another pass's output.
 */

export type PassId = "common" | "bufferA" | "bufferB" | "bufferC" | "bufferD" | "image";

export type RenderPassId = Exclude<PassId, "common">;

export type ChannelSource =
  "none" | "texture" | "bufferA" | "bufferB" | "bufferC" | "bufferD";

export const PASS_ORDER: RenderPassId[] = [
  "bufferA",
  "bufferB",
  "bufferC",
  "bufferD",
  "image",
];

export const PASS_LABELS: Record<PassId, string> = {
  common: "Common",
  bufferA: "Buffer A",
  bufferB: "Buffer B",
  bufferC: "Buffer C",
  bufferD: "Buffer D",
  image: "Image",
};

export type PassSources = Record<PassId, string>;
export type PassRouting = Record<RenderPassId, ChannelSource[]>;

export function emptyPassSources(): PassSources {
  return {
    common: "",
    bufferA: "",
    bufferB: "",
    bufferC: "",
    bufferD: "",
    image: "",
  };
}

export function defaultRouting(): PassRouting {
  const entry = (): ChannelSource[] => ["texture", "none", "none", "none"];
  return {
    bufferA: entry(),
    bufferB: entry(),
    bufferC: entry(),
    bufferD: entry(),
    image: entry(),
  };
}

/** The image pass plus any buffer that has code, in render order. */
export function activePasses(sources: PassSources): RenderPassId[] {
  return PASS_ORDER.filter((id) => id === "image" || sources[id].trim().length > 0);
}

/**
 * Resolves a channel reference to its texture source: "none" | "texture" |
 * or a buffer id (read from that buffer's output — previous frame when the
 * reference is self/circular, which is how Shadertoy persistent buffers work).
 */
export function resolveChannel(source: ChannelSource): "none" | "texture" | RenderPassId {
  return source === "none" || source === "texture" ? source : source;
}

/**
 * Builds the final fragment source for one pass: Common code first, then the
 * pass code. The Shadertoy uniform/wrapping layer is applied downstream in
 * shadertoy.ts (per pass, since each pass may be either dialect).
 */
export function composePassSource(sources: PassSources, pass: RenderPassId): string {
  const common = sources.common.trim();
  const body = sources[pass];
  return common ? `${common}\n${body}` : body;
}
