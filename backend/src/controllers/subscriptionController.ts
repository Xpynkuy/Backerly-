import { Request, Response } from "express";
import { getAuthUserId } from "../utils/getAuthUserId";
import { ServiceError } from "../errors/ServiceError";
import {
  fetchTiersByUsername,
  createTierForUser,
  updateTierById,
  deleteTierById,
  followAuthorService,
  unfollowAuthorService,
  subscribeToTierService,
  cancelPaidSubscriptionService,
  getSubscriptionStatusService,
  fetchSubscriptionsByUsername,
} from "../service/subscriptionService";

const handleError = (res: Response, e: any, logPrefix: string) => {
  if (e instanceof ServiceError) {
    return res.status(e.status).json({ error: e.message });
  }
  console.error(`${logPrefix} error`, e);
  return res.status(500).json({ error: "Server error" });
};

export const getTiersByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const result = await fetchTiersByUsername({ username });
    return res.json(result);
  } catch (e) {
    return handleError(res, e, "getTiersByUsername");
  }
};

export const createTier = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const { title, description, priceCents, sortOrder } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const fileBuffer = req.file?.buffer;

    const tier = await createTierForUser({
      username,
      authUserId,
      title,
      description,
      priceCents: priceCents !== undefined ? Number(priceCents) : null,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : null,
      fileBuffer: fileBuffer ?? null,
    });

    return res.status(201).json(tier);
  } catch (e) {
    return handleError(res, e, "createTier");
  }
};

export const updateTier = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username, tierId } = req.params;
    const { title, description, sortOrder } = req.body;
    const fileBuffer = req.file?.buffer;

    const updated = await updateTierById({
      username,
      tierId,
      authUserId,
      title,
      description,
      sortOrder:
        sortOrder !== undefined && sortOrder !== null
          ? Number(sortOrder)
          : undefined,
      fileBuffer: fileBuffer ?? null,
    });

    return res.json(updated);
  } catch (e) {
    return handleError(res, e, "updateTier");
  }
};

export const deleteTier = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username, tierId } = req.params;

    await deleteTierById({ username, tierId, authUserId });

    return res.status(204).send();
  } catch (e) {
    return handleError(res, e, "deleteTier");
  }
};

export const followAuthor = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const result = await followAuthorService({ username, authUserId });
    return res.json(result);
  } catch (e) {
    return handleError(res, e, "followAuthor");
  }
};

export const unfollowAuthor = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const result = await unfollowAuthorService({ username, authUserId });
    return res.json(result);
  } catch (e) {
    return handleError(res, e, "unfollowAuthor");
  }
};

export const subscribeToTier = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const { tierId, durationMonths } = req.body as {
      tierId?: string;
      durationMonths?: number;
    };

    if (!tierId) {
      return res.status(400).json({ error: "tierId is required" });
    }

    const duration = Number(durationMonths);
    if (duration !== 1 && duration !== 3) {
      return res.status(400).json({ error: "durationMonths must be 1 or 3" });
    }

    const result = await subscribeToTierService({
      username,
      authUserId,
      tierId,
      durationMonths: duration,
    });

    return res.json(result);
  } catch (e) {
    return handleError(res, e, "subscribeToTier");
  }
};

export const cancelPaidSubscription = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const result = await cancelPaidSubscriptionService({
      username,
      authUserId,
    });

    return res.json(result);
  } catch (e) {
    return handleError(res, e, "cancelPaidSubscription");
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    const { username } = req.params;

    const result = await getSubscriptionStatusService({
      username,
      authUserId: authUserId ?? null,
    });

    return res.json(result);
  } catch (e) {
    return handleError(res, e, "getSubscriptionStatus");
  }
};

export const getSubscriptionsByUsername = async (
  req: Request,
  res: Response,
) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;

    const result = await fetchSubscriptionsByUsername({
      username,
      authUserId,
    });

    return res.json(result);
  } catch (e) {
    return handleError(res, e, "getSubscriptionsByUsername");
  }
};
