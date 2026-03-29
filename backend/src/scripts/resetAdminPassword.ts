import { prisma } from "../config/db";
import { hashPassword } from "../utils/password";

const resetAdminPassword = async () => {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

  try {
    const updated = await prisma.user.update({
      where: { email: "admin@test.com" },
      data: {
        password_hash: await hashPassword(ADMIN_PASSWORD),
        must_change_password: false
      }
    });

    console.log("✅ Admin password reset successfully!");
    console.log(JSON.stringify({ 
      email: updated.email, 
      password: ADMIN_PASSWORD 
    }, null, 2));

  } catch (error: any) {
    console.error("❌ Error resetting admin password:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

resetAdminPassword();
