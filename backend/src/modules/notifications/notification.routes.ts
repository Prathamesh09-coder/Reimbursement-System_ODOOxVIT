import { Router } from "express";
import { listNotifications, markAllRead, markAsRead } from "./notification.controller";

const router = Router();

router.get("/", listNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllRead);

export default router;
