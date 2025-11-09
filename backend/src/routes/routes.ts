import { Request, Response, Router } from "express";
import authController from "../controllers/authController";
import { authenticate } from "../middleware/authMIddleware";

const router = Router();

router.post("/register", authController.registration);
router.post("/login", authController.login);
router.post("/logout", authenticate, (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
