import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import { uploadMemory } from "../config/uploadMemory";
import { createPostByUsername, getPostsByUsername, getFeed } from "../controllers/postController";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate";
import { requireCreator } from "../middleware/requireCreator";

 
const router = Router();
 
router.get("/:username/posts", optionalAuthenticate, getPostsByUsername);
router.post(
  "/:username/posts",
  authenticate,
  requireCreator,
  uploadMemory.single("image"),
  createPostByUsername,
);
 
export default router;
 