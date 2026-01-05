import { Router } from "express";
import {
  getUserByUsername,
  updateAvatarByUsername,
  updateBannerByUsername,
} from "../controllers/userController";
import { authenticate } from "../middleware/authMIddleware";
import { uploadMemory } from "../config/uploadMemory";

const router = Router();

router.get("/:username", getUserByUsername);

router.patch(
  "/:username/avatar",
  authenticate,
  uploadMemory.single("avatar"),
  updateAvatarByUsername
);
router.patch(
  "/:username/banner",
  authenticate,
  uploadMemory.single("banner"),
  updateBannerByUsername
);

export default router;
