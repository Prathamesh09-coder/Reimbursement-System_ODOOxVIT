"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovalStatus = exports.moveToNextApprover = exports.checkApprovalRules = exports.updateWorkflowRule = exports.getWorkflow = exports.createWorkflow = exports.getManagerHierarchy = exports.getTeamMembers = exports.assignManager = void 0;
const db_1 = require("../config/db");
// ============ MANAGER RELATIONSHIPS ============
const assignManager = async (employeeId, managerId) => {
    if (employeeId === managerId) {
        throw new Error("Employee cannot be their own manager");
    }
    const employee = await db_1.prisma.user.findUnique({ where: { id: employeeId } });
    const manager = await db_1.prisma.user.findUnique({ where: { id: managerId } });
    if (!employee)
        throw new Error("Employee not found");
    if (!manager)
        throw new Error("Manager not found");
    // Verify manager is actually a manager or admin
    const managerRole = await db_1.prisma.role.findUnique({
        where: { id: manager.role_id },
    });
    if (!["MANAGER", "ADMIN", "DIRECTOR"].includes(managerRole.name)) {
        throw new Error("User is not authorized to be a manager");
    }
    return db_1.prisma.user.update({
        where: { id: employeeId },
        data: { manager_id: managerId },
        include: { manager: true, role: true },
    });
};
exports.assignManager = assignManager;
const getTeamMembers = async (managerId) => {
    const manager = await db_1.prisma.user.findUnique({
        where: { id: managerId },
        include: { subordinates: { include: { role: true } } },
    });
    if (!manager)
        throw new Error("Manager not found");
    return manager.subordinates;
};
exports.getTeamMembers = getTeamMembers;
const getManagerHierarchy = async (employeeId) => {
    const user = await db_1.prisma.user.findUnique({
        where: { id: employeeId },
        include: { manager: { include: { manager: true } } },
    });
    if (!user)
        throw new Error("User not found");
    return user.manager;
};
exports.getManagerHierarchy = getManagerHierarchy;
// ============ WORKFLOW MANAGEMENT ============
const createWorkflow = async (data) => {
    const workflow = await db_1.prisma.workflow.create({
        data: {
            company_id: data.company_id,
            name: data.name,
        },
    });
    // Create steps
    const steps = await Promise.all(data.steps.map((step) => db_1.prisma.workflowStep.create({
        data: {
            workflow_id: workflow.id,
            ...step,
        },
    })));
    // Create rule if provided
    let rule = null;
    if (data.rule) {
        rule = await db_1.prisma.workflowRule.create({
            data: {
                workflow_id: workflow.id,
                ...data.rule,
            },
        });
    }
    return {
        workflow,
        steps,
        rule,
    };
};
exports.createWorkflow = createWorkflow;
const getWorkflow = async (workflowId) => {
    return db_1.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
            steps: { include: { role: true, user: true }, orderBy: { step_order: "asc" } },
            rules: true,
        },
    });
};
exports.getWorkflow = getWorkflow;
const updateWorkflowRule = async (ruleId, data) => {
    return db_1.prisma.workflowRule.update({
        where: { id: ruleId },
        data,
        include: { workflow: { include: { steps: true } } },
    });
};
exports.updateWorkflowRule = updateWorkflowRule;
// ============ APPROVAL RULES ENGINE ============
const checkApprovalRules = async (expenseId, workflowId) => {
    const expense = await db_1.prisma.expense.findUnique({
        where: { id: expenseId },
        include: { approvals: { include: { approver: true, role: true } } },
    });
    const workflow = await db_1.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
            steps: { include: { role: true, user: true } },
            rules: true,
        },
    });
    if (!expense || !workflow)
        throw new Error("Expense or workflow not found");
    const rule = workflow.rules[0];
    if (!rule)
        return { shouldApprove: false, reason: "No approval rule defined" };
    // ============ PERCENTAGE-BASED RULES ============
    if (rule.min_approval_percentage) {
        const totalApprovers = workflow.steps.length;
        const approvedCount = expense.approvals.filter((a) => a.status === "APPROVED").length;
        const approvalPercentage = (approvedCount / totalApprovers) * 100;
        if (approvalPercentage >= rule.min_approval_percentage) {
            return { shouldApprove: true, reason: `${approvalPercentage}% approved` };
        }
    }
    // ============ SPECIFIC APPROVER RULES ============
    if (rule.special_approver_id) {
        const specialApprovalExists = expense.approvals.find((a) => a.approver_id === rule.special_approver_id && a.status === "APPROVED");
        if (specialApprovalExists) {
            return { shouldApprove: true, reason: "Special approver approved" };
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
            };
        }
        const allApproved = expense.approvals.every((a) => a.status === "APPROVED");
        if (allApproved) {
            return { shouldApprove: true, reason: "All steps approved sequentially" };
        }
    }
    return { shouldApprove: false, reason: "Rule conditions not met" };
};
exports.checkApprovalRules = checkApprovalRules;
const moveToNextApprover = async (expenseId, workflowId) => {
    const workflow = await db_1.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { steps: true },
    });
    const expense = await db_1.prisma.expense.findUnique({
        where: { id: expenseId },
    });
    if (!expense || !workflow)
        throw new Error("Expense or workflow not found");
    const nextStepOrder = expense.current_step + 1;
    const nextStep = workflow.steps.find((s) => s.step_order === nextStepOrder);
    if (!nextStep) {
        return { nextApproverId: null, reason: "No more approvers" };
    }
    // Update expense current step
    await db_1.prisma.expense.update({
        where: { id: expenseId },
        data: { current_step: nextStepOrder },
    });
    return {
        nextStepOrder,
        nextStep,
        nextApproverId: nextStep.user_id || nextStep.role_id,
    };
};
exports.moveToNextApprover = moveToNextApprover;
const getApprovalStatus = async (expenseId) => {
    const approvals = await db_1.prisma.expenseApproval.findMany({
        where: { expense_id: expenseId },
        include: { approver: { include: { role: true } }, role: true },
        orderBy: { step_order: "asc" },
    });
    const stats = {
        total: approvals.length,
        approved: approvals.filter((a) => a.status === "APPROVED").length,
        rejected: approvals.filter((a) => a.status === "REJECTED").length,
        pending: approvals.filter((a) => a.status === "PENDING" || !a.status).length,
    };
    return {
        approvals,
        stats,
        approvalPercentage: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
    };
};
exports.getApprovalStatus = getApprovalStatus;
//# sourceMappingURL=workflowService.js.map