import { Router } from "express";
import { getUserByUsername } from "../controllers/userController";

const router = Router();

router.get("/:username", getUserByUsername);

export default router;
