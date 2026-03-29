"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const password_1 = require("../utils/password");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@test.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";
const COMPANY_NAME = process.env.COMPANY_NAME || "Test Corp";
const COMPANY_COUNTRY = process.env.COMPANY_COUNTRY || "India";
const COMPANY_CURRENCY = process.env.COMPANY_CURRENCY || "INR";
const run = async () => {
    // Check if roles exist, if not create them
    const adminRole = await db_1.prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRole) {
        console.log("Creating default roles...");
        await db_1.prisma.role.createMany({
            data: [
                { name: "ADMIN" },
                { name: "MANAGER" },
                { name: "EMPLOYEE" },
                { name: "FINANCE" },
                { name: "DIRECTOR" }
            ],
            skipDuplicates: true
        });
    }
    const existing = await db_1.prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (existing) {
        console.log(`Admin already exists: ${existing.email}`);
        return;
    }
    // Get ADMIN role
    const adminRoleRecord = await db_1.prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRoleRecord) {
        throw new Error("Failed to find or create ADMIN role");
    }
    const company = await db_1.prisma.company.create({
        data: {
            name: COMPANY_NAME,
            country: COMPANY_COUNTRY,
            currency: COMPANY_CURRENCY,
            is_active: true
        }
    });
    const user = await db_1.prisma.user.create({
        data: {
            company_id: company.id,
            role_id: adminRoleRecord.id,
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password_hash: await (0, password_1.hashPassword)(ADMIN_PASSWORD),
            must_change_password: false,
            is_active: true
        }
    });
    console.log("Seeded admin user successfully.");
    console.log(JSON.stringify({ email: user.email, password: ADMIN_PASSWORD }, null, 2));
};
run()
    .catch((error) => {
    console.error("Failed to seed admin user", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await db_1.prisma.$disconnect();
});
//# sourceMappingURL=seedAdmin.js.map