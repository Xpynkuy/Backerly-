import { Request, Response } from "express";
import { getAuthUserId } from "../utils/getAuthUserId";
import { ServiceError } from "../errors/ServiceError";
import { getPayoutInfo, requestWithdrawal } from "../service/payoutService";

export const getMyPayoutInfo = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    const info = await getPayoutInfo(authUserId);
    return res.json(info);
  } catch (e: any) {
    if (e instanceof ServiceError)
      return res.status(e.status).json({ error: e.message });
    console.error("getMyPayoutInfo error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const createWithdrawal = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    const amountCents = Number(req.body?.amountCents);
    if (!amountCents || amountCents <= 0) {
      return res.status(400).json({ error: "amountCents is required" });
    }
    const w = await requestWithdrawal(authUserId, amountCents);
    return res.status(201).json(w);
  } catch (e: any) {
    if (e instanceof ServiceError)
      return res.status(e.status).json({ error: e.message });
    console.error("createWithdrawal error", e);
    return res.status(500).json({ error: "Server error" });
  }
};
