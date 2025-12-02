import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_ACCESS_SECRET } from "../config/env";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader);

    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!JWT_ACCESS_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ error: "Invalid token" });
  }
};
