const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('Checking categories in database...');
    
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log(`Found ${categories.length} categories:`);
    console.log(JSON.stringify(categories, null, 2));
    
    const subcategories = await prisma.subcategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        category: true
      }
    });
    
    console.log(`Found ${subcategories.length} subcategories:`);
    console.log(JSON.stringify(subcategories, null, 2));
  } catch (error) {
    console.error('Error checking categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();