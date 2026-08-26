import type { AppLogger, AppLoggers } from "@challenger-fantasy/logger";
import {
  consoleTransport,
  fileAsyncTransport,
  type LoggerInstance,
  logger as rnLogger,
} from "react-native-logs";

type RNLogger = LoggerInstance<"debug" | "info" | "warn" | "error">;

// * Set to false to silence a logger while developing
const DEV_LOGGERS: Record<keyof AppLoggers, boolean> = {
  auth: true,
  ws: true,
  draft: true,
  api: true,
  admin: true,
  perf: true,
  lifecycle: true,
  query: true,
};

function toAppLogger(log: RNLogger, key: keyof AppLoggers): AppLogger {
  return {
    info: (obj, msg) => {
      if (DEV_LOGGERS[key]) log.info(`[${key}] ${msg} ${JSON.stringify(obj)}`);
    },
    warn: (obj, msg) => {
      if (DEV_LOGGERS[key]) log.warn(`[${key}] ${msg} ${JSON.stringify(obj)}`);
    },
    error: (obj, msg) => {
      if (DEV_LOGGERS[key]) log.error(`[${key}] ${msg} ${JSON.stringify(obj)}`);
    },
    debug: (obj, msg) => {
      if (DEV_LOGGERS[key]) log.debug(`[${key}] ${msg} ${JSON.stringify(obj)}`);
    },
  };
}

const create = (key: keyof AppLoggers) => {
  const log = __DEV__
    ? rnLogger.createLogger({
        severity: "debug",
        transport: consoleTransport,
        transportOptions: {
          colors: {
            info: "blueBright",
            warn: "yellowBright",
            error: "redBright",
            debug: "white",
          },
        },
      })
    : rnLogger.createLogger({
        severity: "warn",
        transport: fileAsyncTransport,
        transportOptions: {
          FS: require("expo-file-system"),
        },
      });
  return toAppLogger(log, key);
};

function createMobileLogger(): AppLoggers {
  return {
    auth: create("auth"),
    ws: create("ws"),
    draft: create("draft"),
    api: create("api"),
    admin: create("admin"),
    perf: create("perf"),
    lifecycle: create("lifecycle"),
    query: create("query"),
  };
}

export const mobileLogger = createMobileLogger();
