import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import expenseRoutes from "./modules/expenses/expense.routes";
import approvalRoutes from "./modules/approvals/approval.routes";
import userRoutes from "./modules/users/user.routes";
import workflowRoutes from "./modules/workflow/workflow.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { auth } from "./middleware/authMiddleware";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use(auth);
app.use("/api/expenses", expenseRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;