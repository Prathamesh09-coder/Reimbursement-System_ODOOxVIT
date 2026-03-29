import { NextFunction, Request, Response } from "express";
import * as approvalService from "./approval.service";

export const listApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const expenses = await approvalService.listPendingApprovalsForUser(req.user);
    
		res.json({ success: true, data: expenses });
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
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const expenseIdParam: string = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
		const expenseId = parseInt(expenseIdParam, 10);
		if (!expenseId || expenseId <= 0) {
			return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
		}

		const result = await approvalService.approve(
			expenseId,
			req.user.id,
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
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const expenseIdParam: string = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
		const expenseId = parseInt(expenseIdParam, 10);
		if (!expenseId || expenseId <= 0) {
			return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
		}

		const result = await approvalService.reject(
			expenseId,
			req.user.id,
			req.body?.remarks || "Rejected"
		);
		res.json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
};
