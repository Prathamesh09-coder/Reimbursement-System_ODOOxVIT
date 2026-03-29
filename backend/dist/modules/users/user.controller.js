"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.listUsers = exports.createUser = void 0;
const userService = __importStar(require("./user.service"));
const db_1 = require("../../config/db");
const createUser = async (req, res, next) => {
    try {
        // Find admin user via role relationship
        const admin = await db_1.prisma.user.findFirst({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const listUsers = async (_req, res, next) => {
    try {
        const users = await userService.listUsers();
        res.json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
};
exports.listUsers = listUsers;
const getUserById = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (!userId || userId <= 0) {
            return res.status(400).json({
                success: false,
                error: { message: "Invalid user ID" }
            });
        }
        const user = await db_1.prisma.user.findUnique({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=user.controller.js.map