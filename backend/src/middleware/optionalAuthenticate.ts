import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/env";

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const auth = (req.headers.authorization ?? "") as string;
    if (!auth.startsWith("Bearer ")) return next();

    const token = auth.slice("Bearer ".length).trim();
    if (!token) return next();

    if (!JWT_ACCESS_SECRET) return next();

    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as any;

    (req as any).user = {
      userId: payload.userId ?? payload.sub ?? payload.id,
    };
  } catch (err) {
  } finally {
    return next();
  }
};
