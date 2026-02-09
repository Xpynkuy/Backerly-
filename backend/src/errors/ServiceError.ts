export class ServiceError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ServiceError";
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ServiceError {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string = "Not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends ServiceError {
  constructor(message: string = "Bad request") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string = "Conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}
