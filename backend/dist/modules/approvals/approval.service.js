"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.reject = exports.approve = void 0;
const db_1 = require("../../config/db");
const expense_service_1 = require("../expenses/expense.service");
const workflowService = __importStar(require("../../services/workflowService"));
const approve = async (expenseId, approverId, remarks) => {
    const expense = await db_1.prisma.expense.findUnique({
        where: { id: expenseId },
        include: { approvals: true }
    });
    if (!expense)
        throw new Error("Expense not found");
    // Create approval record
    await db_1.prisma.expenseApproval.create({
        data: {
            expense_id: expenseId,
            step_order: expense.current_step || 1,
            approver_id: approverId || null,
            status: "APPROVED",
            comment: remarks || "Approved",
            action_time: new Date()
        }
    });
    // Check if workflow rules are satisfied
    let shouldAutoApprove = false;
    let ruleMatch = null;
    if (expense.workflow_id) {
        const ruleCheck = await workflowService.checkApprovalRules(expenseId, expense.workflow_id);
        shouldAutoApprove = ruleCheck.shouldApprove;
        ruleMatch = ruleCheck;
    }
    // Update status based on rules
    let finalStatus = "WAITING_APPROVAL";
    if (shouldAutoApprove) {
        finalStatus = "APPROVED";
    }
    else if (expense.workflow_id) {
        // Move to next approver if sequential
        const nextResult = await workflowService.moveToNextApprover(expenseId, expense.workflow_id);
        if (!nextResult.nextApproverId) {
            finalStatus = "APPROVED";
        }
    }
    const updatedExpense = await (0, expense_service_1.updateExpenseStatus)(expenseId, finalStatus);
    if (approverId) {
        await db_1.prisma.auditLog.create({
            data: {
                expense_id: expenseId,
                user_id: approverId,
                action: "APPROVED",
                comment: remarks || "Expense approved"
            }
        });
    }
    return {
        message: "Expense approved",
        expense: updatedExpense,
        ruleMatch,
        autoApproved: shouldAutoApprove
    };
};
exports.approve = approve;
const reject = async (expenseId, approverId, remarks) => {
    const expense = await (0, expense_service_1.updateExpenseStatus)(expenseId, "REJECTED");
    await db_1.prisma.expenseApproval.create({
        data: {
            expense_id: expenseId,
            step_order: expense.current_step || 1,
            approver_id: approverId || null,
            status: "REJECTED",
            comment: remarks || "Rejected",
            action_time: new Date()
        }
    });
    if (approverId) {
        await db_1.prisma.auditLog.create({
            data: {
                expense_id: expenseId,
                user_id: approverId,
                action: "REJECTED",
                comment: remarks || "Expense rejected"
            }
        });
    }
    return {
        message: "Expense rejected",
        expense
    };
};
exports.reject = reject;
//# sourceMappingURL=approval.service.js.map