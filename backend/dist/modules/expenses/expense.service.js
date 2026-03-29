"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExpenseStatus = exports.getExpenseById = exports.listExpenses = exports.submitExpense = exports.createExpense = void 0;
const db_1 = require("../../config/db");
const currency_service_1 = require("../currency/currency.service");
const createExpense = async (data, user) => {
    const companyCurrency = user.company?.currency || "INR";
    const originalCurrency = data.currency || companyCurrency;
    const originalAmount = Number(data.amount ?? 0);
    let convertedAmount = originalAmount;
    if (originalCurrency !== companyCurrency) {
        convertedAmount = await (0, currency_service_1.convertCurrency)(originalCurrency, companyCurrency, originalAmount);
    }
    const expense = await db_1.prisma.expense.create({
        data: {
            employee_id: user.id,
            company_id: user.company_id,
            category_id: data.category_id || null,
            description: data.description || null,
            expense_date: data.expense_date ? new Date(data.expense_date) : null,
            paid_by: data.paid_by || null,
            remarks: data.remarks || null,
            amount: originalAmount,
            currency: originalCurrency,
            converted_amount: convertedAmount,
            receipt_url: data.receipt_url || null,
            status: "DRAFT",
            current_step: 1,
            workflow_id: null
        }
    });
    await db_1.prisma.auditLog.create({
        data: {
            expense_id: expense.id,
            user_id: user.id,
            action: "CREATED",
            comment: "Expense created"
        }
    });
    return expense;
};
exports.createExpense = createExpense;
const submitExpense = async (expenseId, userId) => {
    const existing = await db_1.prisma.expense.findUnique({ where: { id: expenseId } });
    if (!existing) {
        throw new Error("Expense not found");
    }
    if (existing.status !== "DRAFT") {
        throw new Error("Already submitted");
    }
    await db_1.prisma.expense.update({
        where: { id: expenseId },
        data: {
            status: "WAITING_APPROVAL",
            current_step: 1
        }
    });
    if (userId) {
        await db_1.prisma.auditLog.create({
            data: {
                expense_id: expenseId,
                user_id: userId,
                action: "SUBMITTED",
                comment: "Expense submitted"
            }
        });
    }
    return { message: "Submitted" };
};
exports.submitExpense = submitExpense;
const listExpenses = async () => {
    return db_1.prisma.expense.findMany({
        orderBy: { created_at: "desc" }
    });
};
exports.listExpenses = listExpenses;
const getExpenseById = async (id) => {
    return db_1.prisma.expense.findUnique({
        where: { id },
        include: {
            items: true,
            approvals: true
        }
    });
};
exports.getExpenseById = getExpenseById;
const updateExpenseStatus = async (id, status) => {
    const existing = await db_1.prisma.expense.findUnique({ where: { id } });
    if (!existing) {
        throw new Error("Expense not found");
    }
    return db_1.prisma.expense.update({
        where: { id },
        data: { status }
    });
};
exports.updateExpenseStatus = updateExpenseStatus;
//# sourceMappingURL=expense.service.js.map