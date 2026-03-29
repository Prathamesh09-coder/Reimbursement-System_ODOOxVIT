import { NextFunction, Request, Response } from "express";
import * as userService from "./user.service";
import { prisma } from "../../config/db";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find admin user via role relationship
    const admin = await prisma.user.findFirst({
      where: {
        role: { name: "ADMIN" }
      }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        error: { message: "No admin found. Run seed script first." }
      });
    }

    const user = await userService.createUser(req.body, { company_id: admin.company_id });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.listUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    if (!userId || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid user ID" }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, company: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        company_id: user.company_id,
        role: user.role.name,
        is_active: user.is_active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listRoles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await userService.listRoles();
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    const role = String(req.body?.role || "").trim();

    if (!userId || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid user ID" },
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        error: { message: "role is required" },
      });
    }

    const updatedUser = await userService.updateUserRole(userId, role);
    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role.name,
      },
    });
  } catch (error) {
    next(error);
  }
};