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
exports.getApprovalStatus = exports.moveToNextApprover = exports.checkApprovalRules = exports.updateWorkflowRule = exports.getWorkflow = exports.createWorkflow = exports.getManagerHierarchy = exports.getTeamMembers = exports.assignManager = void 0;
const workflowService = __importStar(require("../../services/workflowService"));
// ============ MANAGER RELATIONSHIPS ============
const assignManager = async (req, res, next) => {
    try {
        const { employeeId, managerId } = req.body;
        if (!employeeId || !managerId) {
            return res.status(400).json({
                success: false,
                error: { message: "employeeId and managerId are required" },
            });
        }
        const result = await workflowService.assignManager(employeeId, managerId);
        res.json({
            success: true,
            data: {
                id: result.id,
                email: result.email,
                name: result.name,
                manager: result.manager,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.assignManager = assignManager;
const getTeamMembers = async (req, res, next) => {
    try {
        const managerId = parseInt(req.params.managerId, 10);
        if (!managerId || managerId <= 0) {
            return res.status(400).json({
                success: false,
                error: { message: "Invalid manager ID" },
            });
        }
        const team = await workflowService.getTeamMembers(managerId);
        res.json({
            success: true,
            data: team.map((u) => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role.name,
            })),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTeamMembers = getTeamMembers;
const getManagerHierarchy = async (req, res, next) => {
    try {
        const employeeId = parseInt(req.params.employeeId, 10);
        if (!employeeId || employeeId <= 0) {
            return res.status(400).json({
                success: false,
                error: { message: "Invalid employee ID" },
            });
        }
        const manager = await workflowService.getManagerHierarchy(employeeId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getManagerHierarchy = getManagerHierarchy;
// ============ WORKFLOW MANAGEMENT ============
const createWorkflow = async (req, res, next) => {
    try {
        const { company_id, name, steps, rule } = req.body;
        if (!company_id || !name || !steps || !Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "company_id, name, and steps array are required",
                },
            });
        }
        const result = await workflowService.createWorkflow({
            company_id,
            name,
            steps,
            rule,
        });
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createWorkflow = createWorkflow;
const getWorkflow = async (req, res, next) => {
    try {
        const workflowId = parseInt(req.params.workflowId, 10);
        if (!workflowId || workflowId <= 0) {
            return res.status(400).json({
                success: false,
                error: { message: "Invalid workflow ID" },
            });
        }
        const workflow = await workflowService.getWorkflow(workflowId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkflow = getWorkflow;
const updateWorkflowRule = async (req, res, next) => {
    try {
        const ruleId = parseInt(req.params.ruleId, 10);
        const { min_approval_percentage, is_sequential, special_approver_id } = req.body;
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateWorkflowRule = updateWorkflowRule;
// ============ APPROVAL RULES CHECKING ============
const checkApprovalRules = async (req, res, next) => {
    try {
        const expenseId = parseInt(req.params.expenseId, 10);
        const workflowId = parseInt(req.params.workflowId, 10);
        if (!expenseId || !workflowId) {
            return res.status(400).json({
                success: false,
                error: { message: "expenseId and workflowId are required" },
            });
        }
        const result = await workflowService.checkApprovalRules(expenseId, workflowId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkApprovalRules = checkApprovalRules;
const moveToNextApprover = async (req, res, next) => {
    try {
        const expenseId = parseInt(req.params.expenseId, 10);
        const workflowId = parseInt(req.params.workflowId, 10);
        if (!expenseId || !workflowId) {
            return res.status(400).json({
                success: false,
                error: { message: "expenseId and workflowId are required" },
            });
        }
        const result = await workflowService.moveToNextApprover(expenseId, workflowId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.moveToNextApprover = moveToNextApprover;
const getApprovalStatus = async (req, res, next) => {
    try {
        const expenseId = parseInt(req.params.expenseId, 10);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getApprovalStatus = getApprovalStatus;
//# sourceMappingURL=workflow.controller.js.map