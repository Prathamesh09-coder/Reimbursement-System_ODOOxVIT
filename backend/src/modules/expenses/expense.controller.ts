import { NextFunction, Request, Response } from "express";
import * as expenseService from "./expense.service";
import { prisma } from "../../config/db";

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await prisma.user.findFirst({
			where: { is_active: true },
			include: { company: true }
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				error: { message: "No active user found. Seed users first." }
			});
		}

		const expense = await expenseService.createExpense(req.body, user);
		res.status(201).json({ success: true, data: expense });
	} catch (error) {
		next(error);
	}
};

export const submitExpense = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const expenseIdParam: string = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
		const expenseId = parseInt(expenseIdParam, 10);
		if (!expenseId || expenseId <= 0) {
			return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
		}

		const actor = await prisma.user.findFirst({ where: { is_active: true } });
		const result = await expenseService.submitExpense(expenseId, actor?.id);
		res.json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
};

export const listExpenses = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const expenses = await expenseService.listExpenses();
		res.json({ success: true, data: expenses });
	} catch (error) {
		next(error);
	}
};

export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const expenseIdParam: string = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
		const expenseId = parseInt(expenseIdParam, 10);
		if (!expenseId || expenseId <= 0) {
			return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
		}

		const expense = await expenseService.getExpenseById(expenseId);

		if (!expense) {
			return res.status(404).json({ success: false, error: { message: "Expense not found" } });
		}

		res.json({ success: true, data: expense });
	} catch (error) {
		next(error);
	}
};
