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
exports.rejectExpense = exports.approveExpense = exports.listApprovals = void 0;
const db_1 = require("../../config/db");
const approvalService = __importStar(require("./approval.service"));
const listApprovals = async (req, res, next) => {
    try {
        // Get approvals, filtering in code to avoid null issue
        const approvals = await db_1.prisma.expenseApproval.findMany();
        // Enrich with related data where available
        const enriched = await Promise.all(approvals
            .filter(a => a.expense_id !== null)
            .map(async (a) => {
            const expense = await db_1.prisma.expense.findUnique({
                where: { id: a.expense_id }
            });
            const approver = await db_1.prisma.user.findUnique({
                where: { id: a.approver_id },
                include: { role: true }
            });
            return { ...a, expense, approver };
        }));
        res.json({ success: true, data: enriched });
    }
    catch (error) {
        next(error);
    }
};
exports.listApprovals = listApprovals;
const approveExpense = async (req, res, next) => {
    try {
        const expenseIdParam = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
        const expenseId = parseInt(expenseIdParam, 10);
        if (!expenseId || expenseId <= 0) {
            return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
        }
        const approver = await db_1.prisma.user.findFirst({ where: { is_active: true } });
        const result = await approvalService.approve(expenseId, approver?.id || undefined, req.body?.remarks || "Approved");
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.approveExpense = approveExpense;
const rejectExpense = async (req, res, next) => {
    try {
        const expenseIdParam = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
        const expenseId = parseInt(expenseIdParam, 10);
        if (!expenseId || expenseId <= 0) {
            return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
        }
        const approver = await db_1.prisma.user.findFirst({ where: { is_active: true } });
        const result = await approvalService.reject(expenseId, approver?.id || undefined, req.body?.remarks || "Rejected");
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectExpense = rejectExpense;
//# sourceMappingURL=approval.controller.js.map