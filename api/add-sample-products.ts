import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function addSampleProducts() {
  try {
    console.log('Adding sample products...');

    const sampleProducts = [
      {
        productCode: 'NECK001',
        name: 'Elegant Diamond Pendant Necklace',
        description: 'A stunning diamond pendant necklace featuring a brilliant-cut diamond set in 18k white gold. Perfect for any occasion.',
        category: 'necklace',
        price: 2500,
        stock: 10,
        isActive: true,
        diamondQuantity: 1,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'NECK002',
        name: 'Luxury Diamond Choker',
        description: 'A bold diamond choker with multiple diamonds arranged in an elegant pattern. Crafted in 18k white gold.',
        category: 'necklace',
        price: 4500,
        stock: 5,
        isActive: true,
        diamondQuantity: 15,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'BRAC001',
        name: 'Classic Diamond Tennis Bracelet',
        description: 'A timeless diamond tennis bracelet with uniform diamonds set in 18k white gold. Perfect for everyday elegance.',
        category: 'bracelet',
        price: 3200,
        stock: 8,
        isActive: true,
        diamondQuantity: 25,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'BRAC002',
        name: 'Vintage Diamond Bracelet',
        description: 'An exquisite vintage-inspired diamond bracelet featuring intricate details and brilliant diamonds.',
        category: 'bracelet',
        price: 3800,
        stock: 6,
        isActive: true,
        diamondQuantity: 30,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'EARR001',
        name: 'Diamond Stud Earrings',
        description: 'Timeless diamond stud earrings in 18k white gold. Classic and elegant, perfect for any occasion.',
        category: 'earrings',
        price: 1800,
        stock: 15,
        isActive: true,
        diamondQuantity: 2,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'EARR002',
        name: 'Diamond Drop Earrings',
        description: 'Elegant diamond drop earrings featuring a brilliant-cut diamond suspended from a delicate chain.',
        category: 'earrings',
        price: 2200,
        stock: 12,
        isActive: true,
        diamondQuantity: 4,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'RING001',
        name: 'Classic Diamond Solitaire Ring',
        description: 'A stunning diamond solitaire ring in 18k white gold. The perfect symbol of everlasting love.',
        category: 'rings',
        price: 3500,
        stock: 10,
        isActive: true,
        diamondQuantity: 1,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'RING002',
        name: 'Diamond Engagement Ring',
        description: 'A beautiful diamond engagement ring featuring a brilliant-cut center stone with a halo of smaller diamonds.',
        category: 'rings',
        price: 4200,
        stock: 8,
        isActive: true,
        diamondQuantity: 15,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'PEND001',
        name: 'Heart Diamond Pendant',
        description: 'A romantic heart-shaped diamond pendant suspended from a delicate chain. Perfect for expressing your love.',
        category: 'pendant',
        price: 1500,
        stock: 20,
        isActive: true,
        diamondQuantity: 1,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
      {
        productCode: 'PEND002',
        name: 'Star Diamond Pendant',
        description: 'A unique star-shaped diamond pendant that sparkles with every movement. Crafted in 18k white gold.',
        category: 'pendant',
        price: 1800,
        stock: 15,
        isActive: true,
        diamondQuantity: 1,
        digitalBrowser: true,
        website: true,
        distributor: false,
      },
    ];

    for (const product of sampleProducts) {
      await prisma.product.create({
        data: product as any
      });
      console.log(`✓ Added product: ${product.name}`);
    }

    console.log(`\n✓ Successfully added ${sampleProducts.length} products!`);
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleProducts();






