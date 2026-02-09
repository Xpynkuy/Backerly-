import { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/ServiceError";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error occurred:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ServiceError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Resource already exists" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Invalid reference" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Resource not found" });
    }
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  return res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};
