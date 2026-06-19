import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const main = async (): Promise<void> => {
  await prisma.comment.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      userName: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      text: `Test comment #${i + 1}`,
      parentId: null,
    })),
  });
};

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
