import { prisma } from "../../config/db";
import { convertCurrency } from "../currency/currency.service";

export const createExpense = async (data: any, user: any) => {
  const companyCurrency = user.company?.currency || "INR";
  const originalCurrency = data.currency || companyCurrency;
  const originalAmount = Number(data.amount ?? 0);
  
  let convertedAmount = originalAmount;
  if (originalCurrency !== companyCurrency) {
    convertedAmount = await convertCurrency(originalCurrency, companyCurrency, originalAmount);
  }

  const expense = await prisma.expense.create({
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

  await prisma.auditLog.create({
    data: {
      expense_id: expense.id,
      user_id: user.id,
      action: "CREATED",
      comment: "Expense created"
    }
  });

  return expense;
};

export const submitExpense = async (expenseId: number, userId?: number): Promise<{ message: string }> => {
  const existing = await prisma.expense.findUnique({ where: { id: expenseId } });

  if (!existing) {
    throw new Error("Expense not found");
  }

  if (existing.status !== "DRAFT") {
    throw new Error("Already submitted");
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      status: "WAITING_APPROVAL",
      current_step: 1
    }
  });

  if (userId) {
    await prisma.auditLog.create({
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

export const listExpenses = async () => {
  return prisma.expense.findMany({
    orderBy: { created_at: "desc" }
  });
};

export const getExpenseById = async (id: number) => {
  return prisma.expense.findUnique({
    where: { id },
    include: {
      items: true,
      approvals: true
    }
  });
};

export const updateExpenseStatus = async (id: number, status: string) => {
  const existing = await prisma.expense.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Expense not found");
  }

  return prisma.expense.update({
    where: { id },
    data: { status }
  });
};