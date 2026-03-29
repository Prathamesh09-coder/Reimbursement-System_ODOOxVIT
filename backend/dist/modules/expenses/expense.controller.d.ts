import { NextFunction, Request, Response } from "express";
export declare const createExpense: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const submitExpense: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listExpenses: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getExpenseById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=expense.controller.d.ts.map