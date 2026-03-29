import { NextFunction, Request, Response } from "express";
type RequestWithUser = Request & {
    user?: {
        role?: string;
    };
};
export declare const allowRoles: (...roles: string[]) => (req: RequestWithUser, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=rbac.middleware.d.ts.map