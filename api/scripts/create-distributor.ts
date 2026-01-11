import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDistributor() {
  try {
    // Get values from command line arguments or environment variables
    const [
      , 
      , 
      firstName = process.env.FIRST_NAME,
      lastName = process.env.LAST_NAME,
      email = process.env.EMAIL,
      password = process.env.PASSWORD,
      phone = process.env.PHONE,
      city = process.env.CITY,
      country = process.env.COUNTRY,
      companyName = process.env.COMPANY_NAME || null,
      status = process.env.STATUS || 'approved' // Default to approved for direct creation
    ] = process.argv;

    // Check if required arguments are provided
    if (!email || !password || !firstName || !lastName || !phone || !city || !country) {
      console.log(`
Usage: 
  npx tsx scripts/create-distributor.ts <firstName> <lastName> <email> <password> <phone> <city> <country> [companyName] [status]

Or set environment variables:
  FIRST_NAME, LAST_NAME, EMAIL, PASSWORD, PHONE, CITY, COUNTRY, COMPANY_NAME, STATUS

Example:
  npx tsx scripts/create-distributor.ts "John" "Doe" "john@example.com" "password123" "+1234567890" "New York" "USA" "Example Co" "approved"
      `);
      process.exit(1);
    }

    // Check if distributor with this email already exists
    const existingDistributor = await prisma.distributor.findUnique({
      where: { email: email }
    });

    if (existingDistributor) {
      console.error(`Error: A distributor with email ${email} already exists.`);
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the distributor
    const distributor = await prisma.distributor.create({
      data: {
        companyName: companyName || null,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        phone: phone,
        city: city,
        country: country,
        status: status,
        totalOrders: 0,
        totalRevenue: 0,
      }
    });

    console.log('✅ Distributor created successfully!');
    console.log('🔑 Distributor ID:', distributor.id);
    console.log('📧 Email:', distributor.email);
    console.log('📊 Status:', distributor.status);
    console.log('🏢 Company:', distributor.companyName || 'N/A');
    console.log('👤 Name:', `${distributor.firstName} ${distributor.lastName}`);
    console.log('📱 Phone:', distributor.phone);
    console.log('📍 Location:', `${distributor.city}, ${distributor.country}`);

  } catch (error) {
    console.error('❌ Error creating distributor:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createDistributor().catch(e => {
  console.error(e);
  process.exit(1);
});