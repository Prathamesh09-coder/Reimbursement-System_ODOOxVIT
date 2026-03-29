"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_controller_1 = require("./expense.controller");
const router = (0, express_1.Router)();
router.get("/", expense_controller_1.listExpenses);
router.post("/", expense_controller_1.createExpense);
router.get("/:expenseId", expense_controller_1.getExpenseById);
router.post("/:expenseId/submit", expense_controller_1.submitExpense);
exports.default = router;
//# sourceMappingURL=expense.routes.js.map