import { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/db";
import * as approvalService from "./approval.service";

export const listApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get approvals, filtering in code to avoid null issue
    const approvals = await prisma.expenseApproval.findMany();
    
    // Enrich with related data where available
    const enriched = await Promise.all(
      approvals
        .filter(a => a.expense_id !== null)
        .map(async (a) => {
          const expense = await prisma.expense.findUnique({
            where: { id: a.expense_id! }
          });
          const approver = await prisma.user.findUnique({
            where: { id: a.approver_id! },
            include: { role: true }
          });
          return { ...a, expense, approver };
        })
    );
    
    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const approveExpense = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const expenseIdParam: string = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
		const expenseId = parseInt(expenseIdParam, 10);
		if (!expenseId || expenseId <= 0) {
			return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
		}

		const approver = await prisma.user.findFirst({ where: { is_active: true } });
		const result = await approvalService.approve(
			expenseId,
			approver?.id || undefined,
			req.body?.remarks || "Approved"
		);
		res.json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
};

export const rejectExpense = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const expenseIdParam: string = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
		const expenseId = parseInt(expenseIdParam, 10);
		if (!expenseId || expenseId <= 0) {
			return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
		}

		const approver = await prisma.user.findFirst({ where: { is_active: true } });
		const result = await approvalService.reject(
			expenseId,
			approver?.id || undefined,
			req.body?.remarks || "Rejected"
		);
		res.json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
};
