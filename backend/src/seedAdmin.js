import bcrypt from 'bcryptjs';
import { prisma } from './config/prisma.js';

async function seed() {
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123456';

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username },
    update: { password: hash, role: 'ADMIN' },
    create: {
      username,
      password: hash,
      role: 'ADMIN'
    }
  });

  // eslint-disable-next-line no-console
  console.log(`Admin user seeded: ${username}`);
}

seed()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
