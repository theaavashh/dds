const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('Checking all admins in database...\n');
    
    const admins = await prisma.admin.findMany();
    
    console.log(`Found ${admins.length} admin(s):\n`);
    
    for (const admin of admins) {
      console.log('Admin:', {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      });
      
      // Test password
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, admin.password);
      console.log('Password check for "admin123":', isValid ? '✅ Valid' : '❌ Invalid');
      console.log('---\n');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();




