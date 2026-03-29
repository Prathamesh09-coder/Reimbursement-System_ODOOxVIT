import { NextFunction, Request, Response } from "express";
import * as userService from "./user.service";
import { prisma } from "../../config/db";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: { message: "Only admin can create users" } });
    }

    const user = await userService.createUser(req.body, { company_id: req.user.company_id });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const users = await userService.listUsers(req.user.company_id);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const userId = parseInt(req.params.id as string, 10);
    if (!userId || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid user ID" }
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, company_id: req.user.company_id },
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
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: { message: "Only admin can update roles" } });
    }

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

    const updatedUser = await userService.updateUserRole(userId, role, req.user.company_id);
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

export const sendPasswordToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: { message: "Only admin can send passwords" } });
    }

    const userId = parseInt(req.params.id as string, 10);
    if (!userId || userId <= 0) {
      return res.status(400).json({ success: false, error: { message: "Invalid user ID" } });
    }

    const result = await userService.sendPasswordToUser(userId, req.user.company_id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};