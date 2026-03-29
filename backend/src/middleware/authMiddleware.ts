import { NextFunction, Request, Response } from "express";

export const auth = (_req: Request, _res: Response, next: NextFunction) => {
  // decode JWT
  next();
};