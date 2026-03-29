import { prisma } from "../config/db";

const buildWorkflowMetadata = (workflow: any) => {
  const primaryRule = workflow.rules?.[0] || null;
  const approvalRule = [
    primaryRule?.is_sequential ? "SEQUENTIAL" : null,
    primaryRule?.min_approval_percentage
      ? `${primaryRule.min_approval_percentage}%_THRESHOLD`
      : null,
    primaryRule?.special_approver_id ? "SPECIAL_APPROVER" : null,
  ]
    .filter(Boolean)
    .join("|");

  return {
    step_count: workflow.steps?.length || 0,
    is_sequential: Boolean(primaryRule?.is_sequential),
    min_approval_percentage: primaryRule?.min_approval_percentage ?? null,
    special_approver_id: primaryRule?.special_approver_id ?? null,
    approval_rule: approvalRule || "NONE",
  };
};

// ============ MANAGER RELATIONSHIPS ============

export const assignManager = async (employeeId: number, managerId: number, companyId: number) => {
  if (employeeId === managerId) {
    throw new Error("Employee cannot be their own manager");
  }

  const employee = await prisma.user.findFirst({ where: { id: employeeId, company_id: companyId } });
  const manager = await prisma.user.findFirst({ where: { id: managerId, company_id: companyId } });

  if (!employee) throw new Error("Employee not found");
  if (!manager) throw new Error("Manager not found");

  // Verify manager is actually a manager or admin
  const managerRole = await prisma.role.findUnique({
    where: { id: manager.role_id },
  });
  if (!["MANAGER", "ADMIN", "DIRECTOR"].includes(managerRole!.name)) {
    throw new Error("User is not authorized to be a manager");
  }

  return prisma.user.update({
    where: { id: employeeId },
    data: { manager_id: managerId },
    include: { manager: true, role: true },
  });
};

export const getTeamMembers = async (managerId: number, companyId: number) => {
  const manager = await prisma.user.findFirst({
    where: { id: managerId, company_id: companyId },
    include: { subordinates: { include: { role: true } } },
  });

  if (!manager) throw new Error("Manager not found");

  return manager.subordinates;
};

export const getManagerHierarchy = async (employeeId: number, companyId: number) => {
  const user = await prisma.user.findFirst({
    where: { id: employeeId, company_id: companyId },
    include: { manager: { include: { manager: true } } },
  });

  if (!user) throw new Error("User not found");

  return user.manager;
};

// ============ WORKFLOW MANAGEMENT ============

export const createWorkflow = async (data: {
  company_id: number;
  name: string;
  steps: Array<{
    step_order: number;
    role_id?: number;
    user_id?: number;
    is_required?: boolean;
  }>;
  rule?: {
    min_approval_percentage?: number;
    is_sequential?: boolean;
    special_approver_id?: number;
  };
}) => {
  const workflow = await prisma.workflow.create({
    data: {
      company_id: data.company_id,
      name: data.name,
    },
  });

  // Create steps
  const steps = await Promise.all(
    data.steps.map((step) =>
      prisma.workflowStep.create({
        data: {
          workflow_id: workflow.id,
          ...step,
        },
      })
    )
  );

  // Create rule if provided
  let rule = null;
  if (data.rule) {
    rule = await prisma.workflowRule.create({
      data: {
        workflow_id: workflow.id,
        ...data.rule,
      },
    });
  }

  const workflowWithRelations = {
    workflow,
    steps,
    rules: rule ? [rule] : [],
  };

  return {
    ...workflowWithRelations,
    metadata: buildWorkflowMetadata(workflowWithRelations),
  };
};

export const listWorkflows = async (companyId: number) => {
  const workflows = await prisma.workflow.findMany({
    where: { company_id: companyId },
    include: {
      steps: { include: { role: true, user: true }, orderBy: { step_order: "asc" } },
      rules: true,
    },
    orderBy: { created_at: "desc" },
  });

  return workflows.map((workflow) => ({
    ...workflow,
    metadata: buildWorkflowMetadata(workflow),
    approval_rule: buildWorkflowMetadata(workflow).approval_rule,
  }));
};

export const getWorkflow = async (workflowId: number, companyId: number) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, company_id: companyId },
    include: {
      steps: { include: { role: true, user: true }, orderBy: { step_order: "asc" } },
      rules: true,
    },
  });

  if (!workflow) return null;

  return {
    ...workflow,
    metadata: buildWorkflowMetadata(workflow),
    approval_rule: buildWorkflowMetadata(workflow).approval_rule,
  };
};

export const updateWorkflowRule = async (ruleId: number, data: any) => {
  return prisma.workflowRule.update({
    where: { id: ruleId },
    data,
    include: { workflow: { include: { steps: true } } },
  });
};

// ============ APPROVAL RULES ENGINE ============

export const checkApprovalRules = async (expenseId: number, workflowId: number) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { approvals: { include: { approver: true, role: true } } },
  });

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      steps: { include: { role: true, user: true } },
      rules: true,
    },
  });

  if (!expense || !workflow) throw new Error("Expense or workflow not found");

  const workflowMetadata = buildWorkflowMetadata(workflow);

  const rule = workflow.rules[0];
  if (!rule) return {
    shouldApprove: false,
    reason: "No approval rule defined",
    metadata: { workflow: workflowMetadata },
  };

  // ============ PERCENTAGE-BASED RULES ============
  if (rule.min_approval_percentage) {
    const totalApprovers = workflow.steps.length;
    const approvedCount = expense.approvals.filter(
      (a: any) => a.status === "APPROVED"
    ).length;
    const approvalPercentage = (approvedCount / totalApprovers) * 100;

    if (approvalPercentage >= rule.min_approval_percentage) {
      return {
        shouldApprove: true,
        reason: `${approvalPercentage}% approved`,
        metadata: { workflow: workflowMetadata, approvalPercentage },
      };
    }
  }

  // ============ SPECIFIC APPROVER RULES ============
  if (rule.special_approver_id) {
    const specialApprovalExists = expense.approvals.find(
      (a: any) => a.approver_id === rule.special_approver_id && a.status === "APPROVED"
    );

    if (specialApprovalExists) {
      return {
        shouldApprove: true,
        reason: "Special approver approved",
        metadata: { workflow: workflowMetadata },
      };
    }
  }

  // ============ SEQUENTIAL RULES ============
  if (rule.is_sequential) {
    const currentStep = expense.current_step;
    const nextStep = currentStep + 1;

    if (nextStep <= workflow.steps.length) {
      return {
        shouldApprove: false,
        reason: `Waiting for step ${nextStep} approval`,
        nextStep,
        metadata: { workflow: workflowMetadata },
      };
    }

    const allApproved = expense.approvals.every(
      (a: any) => a.status === "APPROVED"
    );
    if (allApproved) {
      return {
        shouldApprove: true,
        reason: "All steps approved sequentially",
        metadata: { workflow: workflowMetadata },
      };
    }
  }

  return {
    shouldApprove: false,
    reason: "Rule conditions not met",
    metadata: { workflow: workflowMetadata },
  };
};

export const moveToNextApprover = async (expenseId: number, workflowId: number) => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { steps: true },
  });

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense || !workflow) throw new Error("Expense or workflow not found");

  const nextStepOrder = expense.current_step + 1;
  const nextStep = workflow.steps.find((s: any) => s.step_order === nextStepOrder);

  if (!nextStep) {
    return { nextApproverId: null, reason: "No more approvers" };
  }

  // Update expense current step
  await prisma.expense.update({
    where: { id: expenseId },
    data: { current_step: nextStepOrder },
  });

  return {
    nextStepOrder,
    nextStep,
    nextApproverId: nextStep.user_id || nextStep.role_id,
  };
};

export const getApprovalStatus = async (expenseId: number) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  const workflow = expense?.workflow_id
    ? await prisma.workflow.findUnique({
        where: { id: expense.workflow_id },
        include: {
          steps: { orderBy: { step_order: "asc" } },
          rules: true,
        },
      })
    : null;

  const approvals = await prisma.expenseApproval.findMany({
    where: { expense_id: expenseId },
    include: { approver: { include: { role: true } }, role: true },
    orderBy: { step_order: "asc" },
  });

  const stats = {
    total: approvals.length,
    approved: approvals.filter((a: any) => a.status === "APPROVED").length,
    rejected: approvals.filter((a: any) => a.status === "REJECTED").length,
    pending: approvals.filter((a: any) => a.status === "PENDING" || !a.status).length,
  };

  return {
    approvals,
    stats,
    approvalPercentage: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
    metadata: {
      current_step: expense?.current_step ?? null,
      workflow: workflow ? buildWorkflowMetadata(workflow) : null,
    },
  };
};
