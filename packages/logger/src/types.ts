/**
 * Minimal logger interface that any logger implementation must satisfy.
 * Shared packages should depend on this type, not on pino directly.
 */
export interface AppLogger {
  info(obj: object, msg: string): void;
  warn(obj: object, msg: string): void;
  error(obj: object, msg: string): void;
  debug(obj: object, msg: string): void;
}

/**
 * Named logger instances for different domains.
 * Each app creates one of these at startup and passes
 * the relevant child to each service/handler.
 */
export interface AppLoggers {
  auth: AppLogger;
  ws: AppLogger;
  draft: AppLogger;
  api: AppLogger;
  admin: AppLogger;
  perf: AppLogger;
  lifecycle: AppLogger;
  query: AppLogger;
}

/**
 * Minimal env interface required by createLogger.
 * Your worker's Env type will satisfy this as long as
 * it includes these two optional fields.
 */
export interface LoggerEnv {
  LOG_LEVEL?: string;
  PRETTY_LOGS?: string;
}
