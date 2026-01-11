import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    const admins = await prisma.admin.findMany();
    console.log('Admins in database:');
    console.log(admins);
    
    if (admins.length === 0) {
      console.log('No admins found in database');
    }
  } catch (error) {
    console.error('Error checking admins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();