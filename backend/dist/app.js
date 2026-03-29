"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const expense_routes_1 = __importDefault(require("./modules/expenses/expense.routes"));
const approval_routes_1 = __importDefault(require("./modules/approvals/approval.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const workflow_routes_1 = __importDefault(require("./modules/workflow/workflow.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/expenses", expense_routes_1.default);
app.use("/api/approvals", approval_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/workflows", workflow_routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map