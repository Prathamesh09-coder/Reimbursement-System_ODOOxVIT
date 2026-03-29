import { Router } from "express";
import { createUser, listUsers, getUserById, listRoles, updateUserRole } from "./user.controller";

const router = Router();

router.get("/roles", listRoles);
router.get("/", listUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id/role", updateUserRole);

export default router;
