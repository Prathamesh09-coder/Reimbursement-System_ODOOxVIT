"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = exports.createUser = void 0;
const db_1 = require("../../config/db");
const password_1 = require("../../utils/password");
const createUser = async (data, admin) => {
    const roleName = data.role || "EMPLOYEE";
    // Get role by name
    const role = await db_1.prisma.role.findUnique({
        where: { name: roleName }
    });
    if (!role) {
        throw new Error(`Role "${roleName}" not found in system`);
    }
    const user = await db_1.prisma.user.create({
        data: {
            company_id: admin.company_id,
            role_id: role.id,
            name: data.name,
            email: data.email,
            manager_id: data.manager_id || null,
            password_hash: await (0, password_1.hashPassword)(data.password || "Temp@12345"),
            must_change_password: data.password ? false : true,
            is_active: data.is_active ?? true
        },
        include: { role: true }
    });
    return user;
};
exports.createUser = createUser;
const listUsers = async () => {
    return db_1.prisma.user.findMany({
        select: {
            id: true,
            company_id: true,
            name: true,
            email: true,
            role: { select: { name: true } }
        }
    });
};
exports.listUsers = listUsers;
//# sourceMappingURL=user.service.js.map