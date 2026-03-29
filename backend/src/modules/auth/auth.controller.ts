import { NextFunction, Request, Response } from "express";
import * as service from "./auth.service";
import { prisma } from "../../config/db";

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

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true, company: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        company_id: user.company_id,
        company_name: user.company.name,
        currency: user.company.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};