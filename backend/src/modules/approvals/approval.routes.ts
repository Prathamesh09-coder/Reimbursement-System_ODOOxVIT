import { Router } from "express";
import { listApprovals, approveExpense, rejectExpense } from "./approval.controller";

const router = Router();

router.get("/", listApprovals);
router.post("/:expenseId/approve", approveExpense);
router.post("/:expenseId/reject", rejectExpense);

export default router;
