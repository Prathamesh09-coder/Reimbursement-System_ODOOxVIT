import { NextFunction, Request, Response } from "express";
import * as workflowService from "../../services/workflowService";

// ============ MANAGER RELATIONSHIPS ============

export const assignManager = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: { message: "Only admin can assign manager" } });
    }

    const { employeeId, managerId } = req.body;

    if (!employeeId || !managerId) {
      return res.status(400).json({
        success: false,
        error: { message: "employeeId and managerId are required" },
      });
    }

    const result = await workflowService.assignManager(employeeId, managerId, req.user.company_id);
    res.json({
      success: true,
      data: {
        id: result.id,
        email: result.email,
        name: result.name,
        manager: result.manager,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const managerId = parseInt(req.params.managerId as string, 10);

    if (!managerId || managerId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid manager ID" },
      });
    }

    const team = await workflowService.getTeamMembers(managerId, req.user.company_id);
    res.json({
      success: true,
      data: team.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role.name,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerHierarchy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const employeeId = parseInt(req.params.employeeId as string, 10);

    if (!employeeId || employeeId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid employee ID" },
      });
    }

    const manager = await workflowService.getManagerHierarchy(employeeId, req.user.company_id);
    res.json({
      success: true,
      data: manager
        ? {
            id: manager.id,
            email: manager.email,
            name: manager.name,
            manager: manager.manager,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// ============ WORKFLOW MANAGEMENT ============

export const listWorkflows = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const workflows = await workflowService.listWorkflows(req.user.company_id);
    res.json({
      success: true,
      data: workflows,
      metadata: {
        total: workflows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: { message: "Only admin can create workflows" } });
    }

    const { name, steps, rule } = req.body;

    if (!name || !steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "name and steps array are required",
        },
      });
    }

    const result = await workflowService.createWorkflow({
      company_id: req.user.company_id,
      name,
      steps,
      rule,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const workflowId = parseInt(req.params.workflowId as string, 10);

    if (!workflowId || workflowId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid workflow ID" },
      });
    }

    const workflow = await workflowService.getWorkflow(workflowId, req.user.company_id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: { message: "Workflow not found" },
      });
    }

    res.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkflowRule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: { message: "Only admin can update workflow rules" } });
    }

    const ruleId = parseInt(req.params.ruleId as string, 10);
    const { min_approval_percentage, is_sequential, special_approver_id } =
      req.body;

    if (!ruleId || ruleId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid rule ID" },
      });
    }

    const rule = await workflowService.updateWorkflowRule(ruleId, {
      min_approval_percentage,
      is_sequential,
      special_approver_id,
    });

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// ============ APPROVAL RULES CHECKING ============

export const checkApprovalRules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const expenseId = parseInt(req.params.expenseId as string, 10);
    const workflowId = parseInt(req.params.workflowId as string, 10);

    if (!expenseId || !workflowId) {
      return res.status(400).json({
        success: false,
        error: { message: "expenseId and workflowId are required" },
      });
    }

    const result = await workflowService.checkApprovalRules(
      expenseId,
      workflowId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const moveToNextApprover = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const expenseId = parseInt(req.params.expenseId as string, 10);
    const workflowId = parseInt(req.params.workflowId as string, 10);

    if (!expenseId || !workflowId) {
      return res.status(400).json({
        success: false,
        error: { message: "expenseId and workflowId are required" },
      });
    }

    const result = await workflowService.moveToNextApprover(
      expenseId,
      workflowId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovalStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const expenseId = parseInt(req.params.expenseId as string, 10);

    if (!expenseId || expenseId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid expense ID" },
      });
    }

    const result = await workflowService.getApprovalStatus(expenseId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
