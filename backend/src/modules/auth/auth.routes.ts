import { Router } from "express";
import { forgotPassword, login, me, signup } from "./auth.controller";
import { auth } from "../../middleware/authMiddleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/me", auth, me);

export default router;
