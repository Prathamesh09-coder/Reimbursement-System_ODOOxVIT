import { NextFunction, Request, Response } from "express";

type RequestWithUser = Request & { user?: { role?: string } };

export const allowRoles = (...roles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }

    next();
  };
};