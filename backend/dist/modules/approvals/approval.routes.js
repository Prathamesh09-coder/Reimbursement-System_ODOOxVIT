"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approval_controller_1 = require("./approval.controller");
const router = (0, express_1.Router)();
router.get("/", approval_controller_1.listApprovals);
router.post("/:expenseId/approve", approval_controller_1.approveExpense);
router.post("/:expenseId/reject", approval_controller_1.rejectExpense);
exports.default = router;
//# sourceMappingURL=approval.routes.js.map