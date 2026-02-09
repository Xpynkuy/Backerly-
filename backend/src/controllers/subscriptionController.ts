import { Request, Response } from "express";
import { getAuthUserId } from "../utils/getAuthUserId";
import { ServiceError } from "../errors/ServiceError";
import {
  fetchTiersByUsername,
  createTierForUser,
  updateTierById,
  deleteTierById,
  subscribeToAuthorService,
  unsubscribeFromAuthorService,
  getSubscriptionStatusService,
  fetchSubscriptionsByUsername,
} from "../service/subscriptionService";

export const getTiersByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const result = await fetchTiersByUsername({ username });
    return res.json(result);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("getTiersByUsername error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const createTier = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const { title, description, priceCents } = req.body;

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
      fileBuffer: fileBuffer ?? null,
    });

    return res.status(201).json(tier);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("createTier error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateTier = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username, tierId } = req.params;
    const { title, description, priceCents } = req.body;
    const fileBuffer = req.file?.buffer;

    const updated = await updateTierById({
      username,
      tierId,
      authUserId,
      title,
      description,
      priceCents:
        priceCents !== undefined && priceCents !== null
          ? Number(priceCents)
          : undefined,
      fileBuffer: fileBuffer ?? null,
    });

    return res.json(updated);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("updateTier error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteTier = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username, tierId } = req.params;

    await deleteTierById({ username, tierId, authUserId });

    return res.status(204).send();
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("deleteTier error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const subscribeToAuthor = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const { tierId } = req.body as { tierId?: string };

    const result = await subscribeToAuthorService({
      username,
      authUserId,
      tierId: tierId ?? null,
    });

    return res.json(result);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("subscribeToAuthor error", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const unsubscribeFromAuthor = async (req: Request, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const { username } = req.params;
    const { tierId } = req.body as { tierId?: string };

    const result = await unsubscribeFromAuthorService({
      username,
      authUserId,
      tierId: tierId ?? null,
    });

    return res.json(result);
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("unsubscribeFromAuthor error", e);
    return res.status(500).json({ error: "Server error" });
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
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("getSubscriptionStatus error", e);
    return res.status(500).json({ error: "Server error" });
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
  } catch (e: any) {
    if (e instanceof ServiceError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("getSubscriptionsByUsername error", e);
    return res.status(500).json({ error: "Server error" });
  }
};
