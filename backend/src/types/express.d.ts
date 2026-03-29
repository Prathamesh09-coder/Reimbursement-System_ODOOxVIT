import type { Request } from "express";

declare global {
  namespace Express {
    interface UserContext {
      id: number;
      role: string;
      email: string;
      company_id: number;
    }

    interface Request {
      user?: UserContext;
    }
  }
}

export {};
