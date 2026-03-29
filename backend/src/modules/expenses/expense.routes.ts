import { Router } from "express";
import {
	createExpense,
	getExpenseById,
	listExpenses,
	submitExpense
} from "./expense.controller";

const router = Router();

router.get("/", listExpenses);
router.post("/", createExpense);
router.get("/:expenseId", getExpenseById);
router.post("/:expenseId/submit", submitExpense);

export default router;
