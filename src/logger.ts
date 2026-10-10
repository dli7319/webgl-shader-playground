export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogSink = (level: LogLevel, formatted: string) => void;

export interface Logger {
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function consoleSink(level: LogLevel, formatted: string): void {
  switch (level) {
    case "debug":
      console.log(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

export interface LoggerOptions {
  /** Minimum level to emit. Defaults to "debug" in dev, "info" in production. */
  minLevel?: LogLevel;
  sink?: LogSink;
}

/**
 * Creates a channelled logger. Debug output is silenced in production builds
 * unless a custom `minLevel` says otherwise.
 */
export function createLogger(channel: string, options: LoggerOptions = {}): Logger {
  const minLevel = options.minLevel ?? (IS_PRODUCTION ? "info" : "debug");
  const sink = options.sink ?? consoleSink;

  const log = (level: LogLevel, message: string): void => {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) {
      return;
    }
    sink(level, `[${channel}] ${message}`);
  };

  return {
    debug: (message) => log("debug", message),
    info: (message) => log("info", message),
    warn: (message) => log("warn", message),
    error: (message) => log("error", message),
  };
}
