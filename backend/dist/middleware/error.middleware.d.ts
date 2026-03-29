import { NextFunction, Request, Response } from "express";
type ApiError = Error & {
    statusCode?: number;
    details?: unknown;
};
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const errorHandler: (err: ApiError, _req: Request, res: Response, _next: NextFunction) => void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map