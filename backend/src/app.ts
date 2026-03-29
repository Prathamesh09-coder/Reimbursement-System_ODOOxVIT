import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import expenseRoutes from "./modules/expenses/expense.routes";
import approvalRoutes from "./modules/approvals/approval.routes";
import userRoutes from "./modules/users/user.routes";
import workflowRoutes from "./modules/workflow/workflow.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workflows", workflowRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;