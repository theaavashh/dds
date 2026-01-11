import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DemoCategory = {
  title: string;
  link: string;
  sortOrder?: number;
  isActive?: boolean;
  subcategories: string[];
};

const demoCategories: DemoCategory[] = [
  {
    title: 'Rings',
    link: '/rings',
    sortOrder: 1,
    isActive: true,
    subcategories: ['Engagement Rings', 'Wedding Bands', 'Solitaire Rings']
  },
  {
    title: 'Necklaces',
    link: '/necklaces',
    sortOrder: 2,
    isActive: true,
    subcategories: ['Pendant Necklaces', 'Diamond Necklaces', 'Gold Chains']
  },
  {
    title: 'Earrings',
    link: '/earrings',
    sortOrder: 3,
    isActive: true,
    subcategories: ['Stud Earrings', 'Hoop Earrings', 'Drop Earrings']
  },
  {
    title: 'Bracelets',
    link: '/bracelets',
    sortOrder: 4,
    isActive: true,
    subcategories: ['Tennis Bracelets', 'Bangles', 'Charm Bracelets']
  }
];

async function upsertCategoryWithSubcategories(cat: DemoCategory) {
  // Try to find existing category by title
  const existing = await prisma.category.findFirst({ where: { title: cat.title } });

  let categoryId: string;
  if (!existing) {
    const created = await prisma.category.create({
      data: {
        title: cat.title,
        link: cat.link,
        isActive: cat.isActive ?? true,
        sortOrder: cat.sortOrder ?? 0,
        iconUrl: null,
        imageUrl: null,
        navImage1Url: null,
        navImage2Url: null
      }
    });
    categoryId = created.id;
    console.log(`Created category: ${cat.title}`);
  } else {
    // Update basic fields to ensure consistency
    const updated = await prisma.category.update({
      where: { id: existing.id },
      data: {
        link: cat.link,
        isActive: cat.isActive ?? existing.isActive,
        sortOrder: cat.sortOrder ?? existing.sortOrder
      }
    });
    categoryId = updated.id;
    console.log(`Updated category: ${cat.title}`);
  }

  // Seed subcategories: create missing ones, leave existing untouched
  for (let i = 0; i < cat.subcategories.length; i++) {
    const name = cat.subcategories[i];
    const exists = await prisma.subcategory.findFirst({
      where: { name, categoryId }
    });
    if (!exists) {
      await prisma.subcategory.create({
        data: {
          name,
          categoryId,
          isActive: true,
          sortOrder: i
        }
      });
      console.log(`  Created subcategory: ${name}`);
    } else {
      // Optionally ensure sort order is set in a sensible way
      await prisma.subcategory.update({
        where: { id: exists.id },
        data: { sortOrder: exists.sortOrder ?? i }
      });
      console.log(`  Ensured subcategory exists: ${name}`);
    }
  }
}

async function main() {
  for (const cat of demoCategories) {
    await upsertCategoryWithSubcategories(cat);
  }

  const countCats = await prisma.category.count();
  const countSubs = await prisma.subcategory.count();
  console.log(JSON.stringify({ success: true, message: 'Seeding complete', categories: countCats, subcategories: countSubs }, null, 2));
}

main()
  .catch((err) => {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

