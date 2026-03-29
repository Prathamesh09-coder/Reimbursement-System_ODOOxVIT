"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const testConnection = async () => {
    console.log("🧪 Testing MySQL Connection & Data Retrieval\n");
    try {
        // Test 1: Basic connection
        console.log("1️⃣  Testing Prisma connection...");
        await db_1.prisma.$queryRaw `SELECT 1`;
        console.log("✅ Connected to MySQL successfully!\n");
        // Test 2: Check roles
        console.log("2️⃣  Checking roles table...");
        const roles = await db_1.prisma.role.findMany();
        console.log(`✅ Found ${roles.length} roles:`);
        roles.forEach(r => console.log(`   - ${r.name}`));
        console.log();
        // Test 3: Check companies
        console.log("3️⃣  Checking companies table...");
        const companies = await db_1.prisma.company.findMany();
        console.log(`✅ Found ${companies.length} company/companies:`);
        companies.forEach(c => console.log(`   - ${c.name} (${c.country})`));
        console.log();
        // Test 4: Check users
        console.log("4️⃣  Checking users table...");
        const users = await db_1.prisma.user.findMany({
            include: { role: true, company: true }
        });
        console.log(`✅ Found ${users.length} user(s):`);
        users.forEach(u => console.log(`   - ${u.name} (${u.role.name}) @ ${u.company.name}`));
        console.log();
        // Test 5: Check expenses
        console.log("5️⃣  Checking expenses table...");
        const expenses = await db_1.prisma.expense.findMany({
            include: { employee: true }
        });
        console.log(`✅ Found ${expenses.length} expense(s)`);
        if (expenses.length > 0) {
            console.log("Sample expenses:");
            expenses.slice(0, 3).forEach(e => {
                console.log(`   - ID: ${e.id}, Amount: ${e.amount} ${e.currency}, Status: ${e.status}`);
            });
        }
        console.log();
        // Test 6: Check notifications
        console.log("6️⃣  Checking notifications table...");
        const notifications = await db_1.prisma.notification.findMany();
        console.log(`✅ Found ${notifications.length} notification(s)\n`);
        // Test 7: Create a test record
        console.log("7️⃣  Testing create operation...");
        // Get or create a test user
        let testUser = await db_1.prisma.user.findUnique({
            where: { email: "test@connection.local" }
        });
        if (!testUser) {
            const adminRole = await db_1.prisma.role.findUnique({
                where: { name: "ADMIN" }
            });
            const testCompany = await db_1.prisma.company.findFirst();
            if (adminRole && testCompany) {
                testUser = await db_1.prisma.user.create({
                    data: {
                        company_id: testCompany.id,
                        role_id: adminRole.id,
                        name: "Test User",
                        email: "test@connection.local",
                        password_hash: "test_hash_123",
                        is_active: true
                    }
                });
                console.log(`✅ Created test user: ${testUser.email}`);
            }
        }
        else {
            console.log(`✅ Test user already exists: ${testUser.email}`);
        }
        console.log();
        console.log("✨ ALL TESTS PASSED! Your MySQL connection is working correctly.\n");
        console.log("📊 Summary:");
        console.log(`   - Roles: ${roles.length}`);
        console.log(`   - Companies: ${companies.length}`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Expenses: ${expenses.length}`);
        console.log(`   - Notifications: ${notifications.length}`);
    }
    catch (error) {
        console.error("❌ ERROR:", error.message);
        console.error("\nDebug info:");
        console.error(`Error code: ${error.code}`);
        console.error(`Error details: ${error.toString()}\n`);
        process.exitCode = 1;
    }
    finally {
        await db_1.prisma.$disconnect();
    }
};
testConnection();
//# sourceMappingURL=testConnection.js.map