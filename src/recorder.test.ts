import { describe, expect, it } from "vitest";
import {
  createRecordingSession,
  pickRecordingMimeType,
  recordingFilename,
  RECORDING_MIME_TYPES,
  type RecorderCtor,
} from "./recorder";

describe("pickRecordingMimeType", () => {
  it("prefers vp9 when supported", () => {
    expect(pickRecordingMimeType(() => true)).toBe("video/webm;codecs=vp9");
  });

  it("falls back down the list", () => {
    expect(pickRecordingMimeType((type) => type === "video/webm;codecs=vp8")).toBe(
      "video/webm;codecs=vp8"
    );
    expect(pickRecordingMimeType((type) => type === "video/webm")).toBe("video/webm");
  });

  it("returns null when nothing is supported", () => {
    expect(pickRecordingMimeType(() => false)).toBeNull();
  });
});

describe("recordingFilename", () => {
  it("stamps a sortable date-time", () => {
    const date = new Date(2026, 0, 10, 14, 30, 59);
    expect(recordingFilename(date)).toBe("shader-recording-20260110-143059.webm");
  });

  it("zero-pads components", () => {
    const date = new Date(2026, 10, 2, 3, 4, 5);
    expect(recordingFilename(date)).toBe("shader-recording-20261102-030405.webm");
  });
});

describe("createRecordingSession", () => {
  function fakeRecorder(): { Recorder: RecorderCtor; events: unknown[] } {
    const events: unknown[] = [];
    class FakeRecorder {
      static isTypeSupported = () => true;
      onstop: (() => void) | null = null;
      onerror: (() => void) | null = null;
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      constructor(
        public stream: MediaStream,
        public options?: { mimeType?: string }
      ) {}
      stop() {
        this.ondataavailable?.({ data: new Blob(["chunk"]) });
        events.push("stop");
        this.onstop?.();
      }
      start() {
        events.push("start");
      }
    }
    return { Recorder: FakeRecorder as unknown as RecorderCtor, events };
  }

  const canvas = {
    captureStream: (frameRate: number) => ({ frameRate }) as unknown as MediaStream,
  } as unknown as HTMLCanvasElement;

  it("collects chunks and resolves a typed blob on stop", async () => {
    const { Recorder, events } = fakeRecorder();
    const session = createRecordingSession(canvas, { Recorder });
    const blob = await session.stop();
    expect(events).toEqual(["start", "stop"]);
    expect(blob.type).toBe("video/webm;codecs=vp9");
    expect(blob.size).toBeGreaterThan(0);
  });

  it("throws when no recording type is supported", () => {
    class Unsupported {
      static isTypeSupported = () => false;
    }
    expect(() =>
      createRecordingSession(canvas, {
        Recorder: Unsupported as unknown as RecorderCtor,
      })
    ).toThrow(/WebM recording/);
  });

  it("exposes every candidate type", () => {
    expect(RECORDING_MIME_TYPES).toContain("video/webm");
  });
});
