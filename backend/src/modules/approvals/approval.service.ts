import { prisma } from "../../config/db";
import { updateExpenseStatus } from "../expenses/expense.service";
import * as workflowService from "../../services/workflowService";

export const approve = async (expenseId: number, approverId?: number, remarks?: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { approvals: true }
  });

  if (!expense) throw new Error("Expense not found");

  // Create approval record
  await prisma.expenseApproval.create({
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
    // Move to next approver if sequential
    const nextResult = await workflowService.moveToNextApprover(
      expenseId,
      expense.workflow_id
    );
    if (!nextResult.nextApproverId) {
      finalStatus = "APPROVED";
    }
  }

  const updatedExpense = await updateExpenseStatus(expenseId, finalStatus);

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
  const expense = await updateExpenseStatus(expenseId, "REJECTED");

  await prisma.expenseApproval.create({
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
    await prisma.auditLog.create({
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