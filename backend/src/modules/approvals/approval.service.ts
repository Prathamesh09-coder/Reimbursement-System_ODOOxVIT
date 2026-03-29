import { prisma } from "../../config/db";
import { updateExpenseStatus } from "../expenses/expense.service";
import * as workflowService from "../../services/workflowService";
import { notify } from "../notifications/notification.service";

const getWorkflowForExpense = async (workflowId?: number | null) => {
  if (!workflowId) return null;
  return prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      steps: {
        include: { role: true },
        orderBy: { step_order: "asc" },
      },
      rules: true,
    },
  });
};

const getStepApproverIds = async (
  step: { role_id: number | null; user_id: number | null; role?: { name: string } | null },
  context: { companyId: number; employeeManagerId: number | null }
): Promise<number[]> => {
  if (step.user_id) return [step.user_id];

  if (!step.role_id) return [];

  if (step.role?.name === "MANAGER") {
    return context.employeeManagerId ? [context.employeeManagerId] : [];
  }

  const users = await prisma.user.findMany({
    where: {
      company_id: context.companyId,
      role_id: step.role_id,
      is_active: true,
    },
    select: { id: true },
  });

  return users.map((u) => u.id);
};

const getActionableStepOrdersForUser = async (
  expense: {
    id: number;
    company_id: number;
    current_step: number;
    workflow_id: number | null;
    employee: { manager_id: number | null };
    approvals: Array<{ approver_id: number | null; step_order: number | null; status: string | null }>;
  },
  userId: number
): Promise<number[]> => {
  const workflow = await getWorkflowForExpense(expense.workflow_id);
  if (!workflow || !workflow.steps.length) {
    return expense.employee.manager_id === userId ? [expense.current_step || 1] : [];
  }

  const isSequential = Boolean(workflow.rules?.[0]?.is_sequential);
  const relevantSteps = isSequential
    ? workflow.steps.filter((step) => step.step_order === expense.current_step)
    : workflow.steps;

  const actionable: number[] = [];
  for (const step of relevantSteps) {
    const approverIds = await getStepApproverIds(step, {
      companyId: expense.company_id,
      employeeManagerId: expense.employee.manager_id,
    });

    if (!approverIds.includes(userId)) continue;

    const alreadyActed = expense.approvals.some(
      (a) =>
        a.approver_id === userId &&
        a.step_order === step.step_order &&
        ["APPROVED", "REJECTED"].includes((a.status || "").toUpperCase())
    );

    if (!alreadyActed) {
      actionable.push(step.step_order);
    }
  }

  return actionable;
};

export const listPendingApprovalsForUser = async (user: Express.UserContext) => {
  const expenses = await prisma.expense.findMany({
    where: {
      company_id: user.company_id,
      status: "WAITING_APPROVAL",
    },
    include: {
      employee: { include: { role: true } },
      category: true,
      approvals: {
        include: { approver: true, role: true },
        orderBy: { action_time: "desc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const filtered = await Promise.all(
    expenses.map(async (expense) => {
      const actionable = await getActionableStepOrdersForUser(
        {
          id: expense.id,
          company_id: expense.company_id,
          current_step: expense.current_step,
          workflow_id: expense.workflow_id,
          employee: { manager_id: expense.employee.manager_id },
          approvals: expense.approvals,
        },
        user.id
      );

      if (!actionable.length) return null;
      return expense;
    })
  );

  return filtered.filter(Boolean);
};

export const approve = async (expenseId: number, approverId?: number, remarks?: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { approvals: true, employee: true }
  });

  if (!expense) throw new Error("Expense not found");
  if (!approverId) throw new Error("Approver id is required");

  const approver = await prisma.user.findUnique({
    where: { id: approverId },
    include: { role: true },
  });

  if (!approver) throw new Error("Approver not found");

  const actionableSteps = await getActionableStepOrdersForUser(
    {
      id: expense.id,
      company_id: expense.company_id,
      current_step: expense.current_step,
      workflow_id: expense.workflow_id,
      employee: { manager_id: expense.employee.manager_id },
      approvals: expense.approvals,
    },
    approverId
  );

  if (!actionableSteps.length) {
    throw new Error("You are not assigned to approve this expense at the current step");
  }

  const actedStepOrder = actionableSteps[0] ?? expense.current_step ?? 1;

  // Create approval record
  await prisma.expenseApproval.create({
    data: {
      expense_id: expenseId,
      step_order: actedStepOrder,
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
    const ruleCheck = await workflowService.checkApprovalRules(
      expenseId,
      expense.workflow_id
    );
    shouldAutoApprove = ruleCheck.shouldApprove;
    ruleMatch = ruleCheck;
  }

  // Update status based on rules
  let finalStatus = "WAITING_APPROVAL";
  if (shouldAutoApprove) {
    finalStatus = "APPROVED";
  } else if (expense.workflow_id) {
    const workflow = await getWorkflowForExpense(expense.workflow_id);
    const isSequential = Boolean(workflow?.rules?.[0]?.is_sequential);

    if (isSequential) {
      const nextResult = await workflowService.moveToNextApprover(
        expenseId,
        expense.workflow_id
      );
      if (!nextResult.nextApproverId) {
        finalStatus = "APPROVED";
      }
    }
  }

  const updatedExpense = await updateExpenseStatus(expenseId, finalStatus);

  if (expense.employee_id) {
    await notify(
      expense.employee_id,
      `Expense #${expenseId} was approved by ${approver.name || approver.email}`,
      "APPROVED",
      expense.company_id
    );
  }

  if (approverId) {
    await prisma.auditLog.create({
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

export const reject = async (expenseId: number, approverId?: number, remarks?: string) => {
  if (!approverId) throw new Error("Approver id is required");

  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { employee: true, approvals: true },
  });

  if (!existing) throw new Error("Expense not found");

  const approver = await prisma.user.findUnique({
    where: { id: approverId },
    include: { role: true },
  });

  if (!approver) throw new Error("Approver not found");

  const actionableSteps = await getActionableStepOrdersForUser(
    {
      id: existing.id,
      company_id: existing.company_id,
      current_step: existing.current_step,
      workflow_id: existing.workflow_id,
      employee: { manager_id: existing.employee.manager_id },
      approvals: existing.approvals,
    },
    approverId
  );

  if (!actionableSteps.length) {
    throw new Error("You are not assigned to reject this expense at the current step");
  }

  const actedStepOrder = actionableSteps[0] ?? existing.current_step ?? 1;

  const expense = await updateExpenseStatus(expenseId, "REJECTED");

  await prisma.expenseApproval.create({
    data: {
      expense_id: expenseId,
      step_order: actedStepOrder,
      approver_id: approverId || null,
      status: "REJECTED",
      comment: remarks || "Rejected",
      action_time: new Date()
    }
  });

  if (approverId) {
    await prisma.auditLog.create({
      data: {
        expense_id: expenseId,
        user_id: approverId,
        action: "REJECTED",
        comment: remarks || "Expense rejected"
      }
    });
  }

  if (existing.employee_id) {
    await notify(
      existing.employee_id,
      `Expense #${expenseId} was rejected by ${approver.name || approver.email}`,
      "REJECTED",
      existing.company_id
    );
  }

  return {
    message: "Expense rejected",
    expense
  };
};