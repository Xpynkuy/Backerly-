import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import { uploadMemory } from "../config/uploadMemory";
import { createPostByUsername, getPostsByUsername } from "../controllers/postController";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate";

const router = Router();

router.get("/:username/posts", optionalAuthenticate, getPostsByUsername);
router.post("/:username/posts", authenticate, uploadMemory.single("image"), createPostByUsername);

export default router;
