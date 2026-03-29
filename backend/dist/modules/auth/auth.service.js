"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.forgotPassword = exports.signup = void 0;
const db_1 = require("../../config/db");
const password_1 = require("../../utils/password");
const emailService_1 = require("../../services/emailService");
const signup = async (data) => {
    const { name, email, password, country, companyName } = data;
    // Get ADMIN role
    const adminRole = await db_1.prisma.role.findUnique({
        where: { name: "ADMIN" },
    });
    if (!adminRole)
        throw new Error("ADMIN role not found in system");
    const currency = "INR"; // default currency
    const company = await db_1.prisma.company.create({
        data: {
            name: companyName || name,
            country: country || null,
            currency,
            is_active: true,
        }
    });
    const user = await db_1.prisma.user.create({
        data: {
            company_id: company.id,
            role_id: adminRole.id,
            name,
            email,
            password_hash: await (0, password_1.hashPassword)(password),
            must_change_password: false,
            is_active: true,
        }
    });
    return { user, company };
};
exports.signup = signup;
const forgotPassword = async (email) => {
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("User not found");
    const newPass = (0, password_1.generatePassword)();
    await db_1.prisma.passwordToken.create({
        data: {
            user_id: user.id,
            token: await (0, password_1.hashPassword)(newPass),
            type: "PASSWORD_RESET",
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
    });
    await (0, emailService_1.sendEmail)(user.email, `Your password reset token: ${newPass}`);
    return { message: "Password reset token sent to email" };
};
exports.forgotPassword = forgotPassword;
const login = async (data) => {
    const { email, password } = data;
    const user = await db_1.prisma.user.findUnique({
        where: { email },
        include: { role: true, company: true }
    });
    if (!user || !user.password_hash) {
        const error = new Error("Invalid credentials");
        error.statusCode = 400;
        throw error;
    }
    const isValid = await (0, password_1.comparePassword)(password, user.password_hash);
    if (!isValid) {
        const error = new Error("Invalid credentials");
        error.statusCode = 400;
        throw error;
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        company_id: user.company_id,
    };
};
exports.login = login;
//# sourceMappingURL=auth.service.js.map