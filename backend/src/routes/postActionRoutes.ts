import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import { toggleLike, getComments, addComment } from "../controllers/postController";

const router = Router();

/**
 * Этот router будет монтироваться на /api/posts
 * => итоговые пути будут:
 * /api/posts/:id/like
 * /api/posts/:id/comments
 */

// POST /api/posts/:id/like
router.post("/:id/like", authenticate, toggleLike);

// GET /api/posts/:id/comments
router.get("/:id/comments", getComments);

// POST /api/posts/:id/comments
router.post("/:id/comments", authenticate, addComment);

export default router;
