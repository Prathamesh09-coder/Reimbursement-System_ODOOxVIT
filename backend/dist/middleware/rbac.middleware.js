"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = void 0;
const allowRoles = (...roles) => {
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role || !roles.includes(role)) {
            return res.status(403).json({ success: false, error: { message: "Forbidden" } });
        }
        next();
    };
};
exports.allowRoles = allowRoles;
//# sourceMappingURL=rbac.middleware.js.map