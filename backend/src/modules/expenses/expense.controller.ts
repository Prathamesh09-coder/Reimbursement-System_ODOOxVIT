import { NextFunction, Request, Response } from "express";
import * as expenseService from "./expense.service";
import { prisma } from "../../config/db";

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			include: { company: true }
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				error: { message: "User not found" }
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
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const expenseIdParam: string = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
		const expenseId = parseInt(expenseIdParam, 10);
		if (!expenseId || expenseId <= 0) {
			return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
		}

		const result = await expenseService.submitExpense(expenseId, req.user.id);
		res.json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
};

export const listExpenses = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const expenses = await expenseService.listExpenses(req.user);
		res.json({ success: true, data: expenses });
	} catch (error) {
		next(error);
	}
};

export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const expenseIdParam: string = (Array.isArray(req.params.expenseId) ? req.params.expenseId[0] : req.params.expenseId) || "0";
		const expenseId = parseInt(expenseIdParam, 10);
		if (!expenseId || expenseId <= 0) {
			return res.status(400).json({ success: false, error: { message: "expenseId is required" } });
		}

		const expense = await expenseService.getExpenseById(expenseId, req.user);

		if (!expense) {
			return res.status(404).json({ success: false, error: { message: "Expense not found" } });
		}

		res.json({ success: true, data: expense });
	} catch (error) {
		next(error);
	}
};

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const categories = await expenseService.listCategories(req.user.company_id);
		res.json({ success: true, data: categories });
	} catch (error) {
		next(error);
	}
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
		}

		const name = String(req.body?.name || "").trim();
		if (!name) {
			return res.status(400).json({ success: false, error: { message: "Category name is required" } });
		}

		const category = await expenseService.createCategory(req.user.company_id, name);
		res.status(201).json({ success: true, data: category });
	} catch (error) {
		next(error);
	}
};
