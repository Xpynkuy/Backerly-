import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate";
import { uploadMemory } from "../config/uploadMemory";
import {
  toggleLike,
  getComments,
  addComment,
  deletePost,
  updatePost,
} from "../controllers/postController";

const router = Router();

router.post("/:id/like", authenticate, toggleLike);
router.get("/:id/comments", optionalAuthenticate, getComments);
router.post("/:id/comments", authenticate, addComment);
router.put("/:id", authenticate, uploadMemory.single("image"), updatePost);
router.delete("/:id", authenticate, deletePost);

export default router;