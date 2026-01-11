const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

function parseArgs(argv) {
  const params = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const raw = arg.slice(2);
      const eqIdx = raw.indexOf('=');
      if (eqIdx !== -1) {
        const k = raw.slice(0, eqIdx);
        const v = raw.slice(eqIdx + 1);
        params[k] = v;
      } else {
        const k = raw;
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          params[k] = next;
          i++;
        } else {
          params[k] = 'true';
        }
      }
    }
  }
  return params;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const args = parseArgs(process.argv);
    const fullname = args.fullname;
    const username = args.username;
    const email = args.email ? String(args.email).toLowerCase() : undefined;
    const password = args.password;
    const role = args.role || 'admin';
    const assignRole = args.assignRole === 'true' || args.assignRole === '1';

    if (!fullname || !username || !email || !password) {
      console.error('Missing required arguments: --fullname --username --email --password');
      process.exit(1);
    }

    const existing = await prisma.admin.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existing) {
      console.error('Admin with provided email or username already exists');
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        fullname,
        username,
        email,
        password: hashed,
        role
      }
    });

    if (assignRole) {
      let roleRow = await prisma.role.findUnique({ where: { name: role } });
      if (!roleRow) {
        roleRow = await prisma.role.create({ data: { name: role } });
      }
      await prisma.adminRole.create({
        data: {
          adminId: admin.id,
          roleId: roleRow.id
        }
      });
    }

    const { password: _pw, ...data } = admin;
    console.log(JSON.stringify({ success: true, data }, null, 2));
  } catch (err) {
    console.error(err && err.message ? err.message : String(err));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

