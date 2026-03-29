import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import { verifyAuthToken } from "../utils/token";

const getBearerToken = (header?: string): string | null => {
  if (!header || !header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = getBearerToken(req.header("authorization") || undefined);

  if (!token) {
    return res.status(401).json({ success: false, error: { message: "Missing auth token" } });
  }

  const parsed = verifyAuthToken(token);
  if (!parsed) {
    return res.status(401).json({ success: false, error: { message: "Invalid auth token" } });
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.id },
    include: { role: true },
  });

  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, error: { message: "User not found or inactive" } });
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role.name,
    company_id: user.company_id,
  };

  next();
};