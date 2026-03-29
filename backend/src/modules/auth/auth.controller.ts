import { NextFunction, Request, Response } from "express";
import * as service from "./auth.service";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.signup(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.forgotPassword(req.body.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};