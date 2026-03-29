import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showAllData() {
  try {
    console.log("📊 COMPLETE DATABASE INVENTORY\n");
    console.log("================================\n");

    // Summary counts
    const summary = {
      Companies: await prisma.company.count(),
      Users: await prisma.user.count(),
      Roles: await prisma.role.count(),
      Expenses: await prisma.expense.count(),
      ExpenseCategories: await prisma.expenseCategory.count(),
      Workflows: await prisma.workflow.count(),
      Notifications: await prisma.notification.count(),
      AuditLogs: await prisma.auditLog.count(),
    };

    console.log("📈 Record Counts by Table:");
    Object.entries(summary).forEach(([table, count]) => {
      console.log(`   ${table.padEnd(20)}: ${count} records`);
    });

    // Users detail
    console.log("\n👥 Users in System:");
    const users = await prisma.user.findMany({ include: { role: true } });
    users.forEach((u) => {
      console.log(`   [${u.id}] ${u.email} → Role: ${u.role.name}`);
    });

    // Expenses detail
    console.log("\n💰 Expenses in System:");
    const expenses = await prisma.expense.findMany();
    expenses.forEach((e) => {
      console.log(
        `   [${e.id}] ${e.amount} ${e.currency} - ${e.description} (${e.status})`
      );
    });

    // Categories detail
    console.log("\n📂 Expense Categories:");
    const categories = await prisma.expenseCategory.findMany();
    if (categories.length > 0) {
      categories.forEach((c) => console.log(`   - ${c.name}`));
    } else {
      console.log("   (No categories found)");
    }

    console.log("\n✅ RESULT: Backend successfully fetches all your data!\n");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

showAllData();
