import { Router } from "express";
import { authenticate } from "../middleware/authMIddleware";
import {
  getNotifications,
  getNotificationsCount,
  markRead,
} from "../controllers/notificationController";

const router = Router();

router.get("/", authenticate, getNotifications);
router.get("/count", authenticate, getNotificationsCount);
router.post("/read", authenticate, markRead);

export default router;
