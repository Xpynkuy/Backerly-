import { Request } from "express";

export function getAuthUserId(req: Request): string | undefined {
  const u = (req as any).user;
  if (!u) return undefined;
  return (u.userId ?? u.id ?? u.sub) as string | undefined;
}
