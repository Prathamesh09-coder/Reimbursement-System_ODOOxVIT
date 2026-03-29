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
exports.getExpenseById = exports.listExpenses = exports.submitExpense = exports.createExpense = void 0;
const expenseService = __importStar(require("./expense.service"));
const db_1 = require("../../config/db");
const createExpense = async (req, res, next) => {
    try {
        const user = await db_1.prisma.user.findFirst({
            where: { is_active: true },
            include: { company: true }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: { message: "No active user found. Seed users first." }
            });
        }
        const expense = await expenseService.createExpense(req.body, user);
        res.status(201).json({ success: true, data: expense });
    }
    catch (error) {
        next(error);
    }
};
exports.createExpense = createExpense;
const submitExpense = async (req, res, next) => {
    try {
        const expenseIdParam = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
        const expenseId = parseInt(expenseIdParam, 10);
        if (!expenseId || expenseId <= 0) {
            return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
        }
        const actor = await db_1.prisma.user.findFirst({ where: { is_active: true } });
        const result = await expenseService.submitExpense(expenseId, actor?.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.submitExpense = submitExpense;
const listExpenses = async (_req, res, next) => {
    try {
        const expenses = await expenseService.listExpenses();
        res.json({ success: true, data: expenses });
    }
    catch (error) {
        next(error);
    }
};
exports.listExpenses = listExpenses;
const getExpenseById = async (req, res, next) => {
    try {
        const expenseIdParam = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
        const expenseId = parseInt(expenseIdParam, 10);
        if (!expenseId || expenseId <= 0) {
            return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
        }
        const expense = await expenseService.getExpenseById(expenseId);
        if (!expense) {
            return res.status(404).json({ success: false, error: { message: "Expense not found" } });
        }
        res.json({ success: true, data: expense });
    }
    catch (error) {
        next(error);
    }
};
exports.getExpenseById = getExpenseById;
//# sourceMappingURL=expense.controller.js.map