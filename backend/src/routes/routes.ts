import { Request, Response, Router } from "express";
import authController from "../controllers/authController";
import { authenticate } from "../middleware/authMIddleware";

const router = Router();

router.post("/register", authController.registration);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me)

export default router;
