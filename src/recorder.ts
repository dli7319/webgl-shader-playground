export const RECORDING_MIME_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
] as const;

/**
 * Feature-detects the best supported WebM recording type. Returns null when
 * the browser cannot record canvas streams (caller should hide the button).
 */
export function pickRecordingMimeType(
  isTypeSupported: (type: string) => boolean
): string | null {
  for (const type of RECORDING_MIME_TYPES) {
    if (isTypeSupported(type)) {
      return type;
    }
  }
  return null;
}

/** `shader-recording-20260110-143059.webm`-style filename. */
export function recordingFilename(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp =
    `${date.getFullYear()}` +
    `${pad(date.getMonth() + 1)}` +
    `${pad(date.getDate())}` +
    `-${pad(date.getHours())}` +
    `${pad(date.getMinutes())}` +
    `${pad(date.getSeconds())}`;
  return `shader-recording-${stamp}.webm`;
}

export interface RecordingSession {
  stop: () => Promise<Blob>;
}

export interface RecorderCtor {
  new (stream: MediaStream, options?: { mimeType?: string }): MediaRecorder;
  isTypeSupported(type: string): boolean;
}

/**
 * Records the given canvas to a WebM blob. Resolves with the blob when
 * stopped. The canvas must be actively rendered to produce frames.
 */
export function createRecordingSession(
  canvas: HTMLCanvasElement,
  options: {
    frameRate?: number;
    mimeType?: string | null;
    Recorder?: RecorderCtor;
  } = {}
): RecordingSession {
  const Recorder = options.Recorder ?? window.MediaRecorder;
  const mimeType = options.mimeType ?? pickRecordingMimeType(Recorder.isTypeSupported);
  if (!mimeType) {
    throw new Error("MediaRecorder does not support WebM recording");
  }
  const stream = canvas.captureStream(options.frameRate ?? 60);
  const recorder = new Recorder(stream, { mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  recorder.start();

  return {
    stop: () =>
      new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        recorder.onerror = () => reject(new Error("Recording failed"));
        recorder.stop();
      }),
  };
}
