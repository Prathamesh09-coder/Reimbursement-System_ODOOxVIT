import { prisma } from "../../config/db";
import { convertCurrency } from "../currency/currency.service";
import { notify } from "../notifications/notification.service";

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

  let workflowId = existing.workflow_id;
  if (!workflowId) {
    const companyWorkflow = await prisma.workflow.findFirst({
      where: { company_id: existing.company_id },
      orderBy: { created_at: "asc" },
    });
    workflowId = companyWorkflow?.id || null;
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      status: "WAITING_APPROVAL",
      current_step: 1,
      workflow_id: workflowId,
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

  const employee = await prisma.user.findUnique({ where: { id: existing.employee_id } });
  const approvers = await prisma.user.findMany({
    where: {
      company_id: existing.company_id,
      OR: [
        { id: employee?.manager_id || -1 },
        { role: { name: { in: ["ADMIN", "FINANCE", "DIRECTOR"] } } },
      ],
      is_active: true,
    },
    include: { role: true },
  });

  await Promise.all(
    approvers
      .filter((approver) => approver.id !== existing.employee_id)
      .map((approver) =>
        notify(
          approver.id,
          `Expense #${existing.id} was submitted and is waiting for approval`,
          "APPROVAL",
          existing.company_id
        )
      )
  );

  return { message: "Submitted" };
};

export const listExpenses = async (user: Express.UserContext) => {
  const role = user.role.toUpperCase();
  const baseWhere: any = { company_id: user.company_id };

  if (role === "EMPLOYEE") {
    baseWhere.employee_id = user.id;
  }

  if (role === "MANAGER") {
    const team = await prisma.user.findMany({
      where: { manager_id: user.id },
      select: { id: true },
    });

    const teamIds = team.map((u) => u.id);
    baseWhere.OR = [
      { employee_id: user.id },
      { employee_id: { in: teamIds.length ? teamIds : [-1] } },
    ];
    delete baseWhere.employee_id;
  }

  return prisma.expense.findMany({
    where: baseWhere,
    include: {
      category: true,
      employee: { include: { role: true } },
    },
    orderBy: { created_at: "desc" }
  });
};

export const getExpenseById = async (id: number, user: Express.UserContext) => {
  return prisma.expense.findFirst({
    where: { id, company_id: user.company_id },
    include: {
      items: true,
      approvals: {
        include: {
          approver: { include: { role: true } },
          role: true,
        },
        orderBy: { step_order: "asc" },
      },
      category: true,
      employee: { include: { role: true } },
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

export const listCategories = async (companyId: number) => {
  return prisma.expenseCategory.findMany({
    where: { company_id: companyId },
    orderBy: { name: "asc" },
  });
};

export const createCategory = async (companyId: number, name: string) => {
  return prisma.expenseCategory.create({
    data: {
      company_id: companyId,
      name,
    },
  });
};