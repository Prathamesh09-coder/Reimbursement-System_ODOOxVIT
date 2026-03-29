import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDataFetch() {
  try {
    console.log("🔍 Testing Data Retrieval from MySQL...\n");

    // Test Users
    const users = await prisma.user.findMany({
      include: { role: true, company: true },
    });
    console.log(`✅ Users: ${users.length} found`);
    users.forEach((u) =>
      console.log(`   - ID: ${u.id}, Email: ${u.email}, Role: ${u.role.name}`)
    );

    // Test Expenses
    const expenses = await prisma.expense.findMany({
      include: { employee: true },
    });
    console.log(`\n✅ Expenses: ${expenses.length} found`);
    expenses.forEach((e) =>
      console.log(
        `   - ID: ${e.id}, Amount: ${e.amount} ${e.currency}, Status: ${e.status}`
      )
    );

    // Test Approvals
    const approvals = await prisma.expenseApproval.findMany({
      include: { expense: true, approver: true },
    });
    console.log(`\n✅ Approvals: ${approvals.length} found`);
    approvals.forEach((a) =>
      console.log(
        `   - ID: ${a.id}, Expense: ${a.expense.description}, Status: ${a.status}`
      )
    );

    // Test Categories
    const categories = await prisma.expenseCategory.findMany();
    console.log(`\n✅ Categories: ${categories.length} found`);
    categories.forEach((c) => console.log(`   - ${c.id}: ${c.name}`));

    // Test All Tables Summary
    console.log("\n📊 Complete Database Summary:");
    const tableStats = {
      companies: await prisma.company.count(),
      users: await prisma.user.count(),
      roles: await prisma.role.count(),
      expenses: await prisma.expense.count(),
      approvals: await prisma.expenseApproval.count(),
      workflows: await prisma.workflow.count(),
      categories: await prisma.expenseCategory.count(),
      notifications: await prisma.notification.count(),
      auditLogs: await prisma.auditLog.count(),
    };

    Object.entries(tableStats).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });

    console.log("\n✨ Backend can fetch all your data successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDataFetch();
