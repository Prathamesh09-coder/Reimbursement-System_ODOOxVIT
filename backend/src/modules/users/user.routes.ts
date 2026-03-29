import { Router } from "express";
import { createUser, listUsers, getUserById, listRoles, sendPasswordToUser, updateUserRole } from "./user.controller";

const router = Router();

router.get("/roles", listRoles);
router.get("/", listUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.post("/:id/send-password", sendPasswordToUser);
router.patch("/:id/role", updateUserRole);

export default router;
