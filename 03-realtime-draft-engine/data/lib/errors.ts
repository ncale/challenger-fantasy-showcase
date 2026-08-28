export class AppError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export class EntityServiceError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "EntityServiceError";
  }
}

export class PayloadError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "PayloadError";
  }
}

export class SupabaseError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "SupabaseError";
  }
}

export class InvariantError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "InvariantError";
  }
}

export class JobServiceError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "JobServiceError";
  }
}

export class InvalidJobError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "JobError";
  }
}

export class NotImplementedError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "NotImplementedError";
  }
}

export class BadDataError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "BadDataError";
  }
}
