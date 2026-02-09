import { Router } from "express";
import { uploadMemory } from "../config/uploadMemory";
import {
  getTiersByUsername,
  createTier,
  updateTier,
  deleteTier,
  subscribeToAuthor,
  unsubscribeFromAuthor,
  getSubscriptionStatus,
  getSubscriptionsByUsername,

} from "../controllers/subscriptionController";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate";
import { authenticate } from "../middleware/authMIddleware";
import {  getUserByUsernameController, searchUsersController, updateAvatarByUsername, updateBannerByUsername, updateDescriptionByUsername } from "../controllers/userController";


const router = Router();
router.get("/search", authenticate, searchUsersController)
router.get("/:username/subscriptions", authenticate, getSubscriptionsByUsername);
router.get("/:username", optionalAuthenticate, getUserByUsernameController);

router.patch("/:username/avatar",  authenticate, uploadMemory.single("avatar"), updateAvatarByUsername);
router.patch("/:username/banner", authenticate, uploadMemory.single("banner"), updateBannerByUsername);


router.get("/:username/tiers", getTiersByUsername);
router.post("/:username/tiers", authenticate, uploadMemory.single("image"), createTier);
router.put("/:username/tiers/:tierId", authenticate, uploadMemory.single("image"), updateTier);
router.delete("/:username/tiers/:tierId", authenticate, deleteTier);


router.post("/:username/subscribe", authenticate, subscribeToAuthor);
router.post("/:username/unsubscribe", authenticate, unsubscribeFromAuthor);
router.get("/:username/subscription-status", authenticate, getSubscriptionStatus);

router.patch("/:username/description", authenticate, updateDescriptionByUsername);



export default router;
