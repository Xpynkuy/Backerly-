import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import { getDashboardStats } from "../controllers/statsController";

const router = Router();

router.get("/dashboard", authenticate, getDashboardStats);

export default router;
