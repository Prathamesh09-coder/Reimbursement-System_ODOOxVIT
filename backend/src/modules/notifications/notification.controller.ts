import { NextFunction, Request, Response } from "express";
import * as notificationService from "./notification.service";

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const notifications = await notificationService.listNotifications(req.user.id, req.user.company_id);
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const idParam = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) || "0";
    const id = Number.parseInt(idParam, 10);
    if (!id) {
      return res.status(400).json({ success: false, error: { message: "Invalid notification id" } });
    }

    const updated = await notificationService.markAsRead(id, req.user.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const result = await notificationService.markAllRead(req.user.id, req.user.company_id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
