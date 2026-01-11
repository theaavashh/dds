import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const fullname = 'Sajib Shrestha';
  const username = 'sajibstha';
  const email = 'sajibstha@celebrationdiamon.com'.toLowerCase();
  const password = 'sajib123';
  const role = 'admin';
  const assignRole = true;

  const existing = await prisma.admin.findFirst({
    where: { OR: [{ email }, { username }] }
  });

  if (existing) {
    console.error('Admin with provided email or username already exists');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: { fullname, username, email, password: hashed, role }
  });

  if (assignRole) {
    let roleRow = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRow) {
      roleRow = await prisma.role.create({ data: { name: role } });
    }
    await prisma.adminRole.create({ data: { adminId: admin.id, roleId: roleRow.id } });
  }

  const { password: _pw, ...data } = admin as any;
  console.log(JSON.stringify({ success: true, data }, null, 2));
}

main()
  .catch((err) => {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

