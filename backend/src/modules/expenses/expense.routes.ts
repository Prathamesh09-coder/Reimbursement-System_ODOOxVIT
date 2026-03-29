import { Router } from "express";
import {
	createCategory,
	createExpense,
	getExpenseById,
	listCategories,
	listExpenses,
	submitExpense
} from "./expense.controller";

const router = Router();

router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.get("/", listExpenses);
router.post("/", createExpense);
router.get("/:expenseId", getExpenseById);
router.post("/:expenseId/submit", submitExpense);

export default router;
