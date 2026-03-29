import { prisma } from "../config/db";

const checkCategories = async () => {
  const categories = await prisma.expenseCategory.findMany();
  console.log("📁 Available Expense Categories:");
  if (categories.length === 0) {
    console.log("   None found. Creating sample categories...");
    
    const newCats = await Promise.all([
      prisma.expenseCategory.create({
        data: { company_id: 1, name: "Travel" }
      }),
      prisma.expenseCategory.create({
        data: { company_id: 1, name: "Food & Beverage" }
      }),
      prisma.expenseCategory.create({
        data: { company_id: 1, name: "Office Supplies" }
      }),
      prisma.expenseCategory.create({
        data: { company_id: 1, name: "Equipment" }
      }),
    ]);
    
    newCats.forEach(c => console.log(`   ✅ ${c.name} (ID: ${c.id})`));
  } else {
    categories.forEach(c => console.log(`   - ${c.name} (ID: ${c.id})`));
  }
  
  await prisma.$disconnect();
};

checkCategories();
