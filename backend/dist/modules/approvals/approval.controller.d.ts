import { NextFunction, Request, Response } from "express";
export declare const listApprovals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const approveExpense: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectExpense: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=approval.controller.d.ts.map