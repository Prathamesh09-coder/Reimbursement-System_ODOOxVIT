import { Router } from "express";
import * as controller from "./workflow.controller";

const router = Router();

// ============ MANAGER RELATIONSHIPS ============
router.post("/managers/assign", controller.assignManager);
router.get("/managers/:managerId/team", controller.getTeamMembers);
router.get("/employees/:employeeId/manager", controller.getManagerHierarchy);

// ============ WORKFLOW MANAGEMENT ============
router.post("/", controller.createWorkflow);
router.get("/", controller.listWorkflows);
router.get("/:workflowId", controller.getWorkflow);
router.put("/rules/:ruleId", controller.updateWorkflowRule);

// ============ APPROVAL RULES ============
router.get("/expenses/:expenseId/rules/:workflowId", controller.checkApprovalRules);
router.post("/expenses/:expenseId/next-approver/:workflowId", controller.moveToNextApprover);
router.get("/expenses/:expenseId/approval-status", controller.getApprovalStatus);

export default router;
