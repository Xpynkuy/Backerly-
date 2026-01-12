import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import { uploadMemory } from "../config/uploadMemory";
import {
  createPostByUsername,
  getPostsByUsername,
} from "../controllers/postController";

const router = Router();

/**
 * ВАЖНО:
 * Этот router будет монтироваться на /api/users
 * => здесь пути начинаются НЕ с /users, а сразу с /:username/...
 */

// GET /api/users/:username/posts
router.get("/:username/posts", getPostsByUsername);

// POST /api/users/:username/posts
router.post(
  "/:username/posts",
  authenticate,
  uploadMemory.single("image"),
  createPostByUsername
);

export default router;
