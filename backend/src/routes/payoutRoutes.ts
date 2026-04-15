import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import { requireCreator } from "../middleware/requireCreator";
import {
  getMyPayoutInfo,
  createWithdrawal,
} from "../controllers/payoutController";

const router = Router();

router.get("/me", authenticate, requireCreator, getMyPayoutInfo);
router.post("/withdraw", authenticate, requireCreator, createWithdrawal);

export default router;
