"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route not found: ${req.method} ${req.originalUrl}`
        }
    });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || "Internal Server Error",
            ...(err.details ? { details: err.details } : {})
        }
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map