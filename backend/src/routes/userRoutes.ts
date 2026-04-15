import { Router } from "express";
import { uploadMemory } from "../config/uploadMemory";
import {
  getTiersByUsername,
  createTier,
  updateTier,
  deleteTier,
  followAuthor,
  unfollowAuthor,
  subscribeToTier,
  cancelPaidSubscription,
  getSubscriptionStatus,
  getSubscriptionsByUsername,
} from "../controllers/subscriptionController";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate";
import { authenticate } from "../middleware/authMIddleware";

import {
  getUserByUsernameController,
  searchUsersController,
  updateAvatarByUsername,
  updateBannerByUsername,
  updateDescriptionByUsername,
  activateCreatorController,
} from "../controllers/userController";
import { requireCreator } from "../middleware/requireCreator";


const router = Router();

router.get("/search", authenticate, searchUsersController);
router.post("/activate-creator", authenticate, activateCreatorController);
router.get(
  "/:username/subscriptions",
  authenticate,
  getSubscriptionsByUsername,
);
router.get("/:username", optionalAuthenticate, getUserByUsernameController);

router.patch(
  "/:username/avatar",
  authenticate,
  uploadMemory.single("avatar"),
  updateAvatarByUsername,
);
router.patch(
  "/:username/banner",
  authenticate,
  uploadMemory.single("banner"),
  updateBannerByUsername,
);

router.get("/:username/tiers", getTiersByUsername);
router.post(
  "/:username/tiers",
  authenticate,
  requireCreator,
  uploadMemory.single("image"),
  createTier,
);
router.put(
  "/:username/tiers/:tierId",
  authenticate,
  requireCreator,
  uploadMemory.single("image"),
  updateTier,
);
router.delete(
  "/:username/tiers/:tierId",
  authenticate,
  requireCreator,
  deleteTier,
);

// Follow (free) — independent from paid
router.post("/:username/follow", authenticate, followAuthor);
router.post("/:username/unfollow", authenticate, unfollowAuthor);

// Paid subscription — independent from follow
router.post("/:username/subscribe", authenticate, subscribeToTier);
router.post("/:username/unsubscribe", authenticate, cancelPaidSubscription);

router.get(
  "/:username/subscription-status",
  optionalAuthenticate,
  getSubscriptionStatus,
);

router.patch(
  "/:username/description",
  authenticate,
  updateDescriptionByUsername,
);

export default router;
