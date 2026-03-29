"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const password_1 = require("../utils/password");
const resetAdminPassword = async () => {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";
    try {
        const updated = await db_1.prisma.user.update({
            where: { email: "admin@test.com" },
            data: {
                password_hash: await (0, password_1.hashPassword)(ADMIN_PASSWORD),
                must_change_password: false
            }
        });
        console.log("✅ Admin password reset successfully!");
        console.log(JSON.stringify({
            email: updated.email,
            password: ADMIN_PASSWORD
        }, null, 2));
    }
    catch (error) {
        console.error("❌ Error resetting admin password:", error.message);
        process.exitCode = 1;
    }
    finally {
        await db_1.prisma.$disconnect();
    }
};
resetAdminPassword();
//# sourceMappingURL=resetAdminPassword.js.map