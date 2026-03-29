"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const checkCategories = async () => {
    const categories = await db_1.prisma.expenseCategory.findMany();
    console.log("📁 Available Expense Categories:");
    if (categories.length === 0) {
        console.log("   None found. Creating sample categories...");
        const newCats = await Promise.all([
            db_1.prisma.expenseCategory.create({
                data: { company_id: 1, name: "Travel" }
            }),
            db_1.prisma.expenseCategory.create({
                data: { company_id: 1, name: "Food & Beverage" }
            }),
            db_1.prisma.expenseCategory.create({
                data: { company_id: 1, name: "Office Supplies" }
            }),
            db_1.prisma.expenseCategory.create({
                data: { company_id: 1, name: "Equipment" }
            }),
        ]);
        newCats.forEach(c => console.log(`   ✅ ${c.name} (ID: ${c.id})`));
    }
    else {
        categories.forEach(c => console.log(`   - ${c.name} (ID: ${c.id})`));
    }
    await db_1.prisma.$disconnect();
};
checkCategories();
//# sourceMappingURL=checkCategories.js.map