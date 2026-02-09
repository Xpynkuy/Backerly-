import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import { toggleLike, getComments, addComment, deletePost } from "../controllers/postController";

const router = Router();

router.post("/:id/like", authenticate, toggleLike);
router.get("/:id/comments", getComments);
router.post("/:id/comments", authenticate, addComment);
router.delete("/:id", authenticate, deletePost);

export default router;
