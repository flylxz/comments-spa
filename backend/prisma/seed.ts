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

const seed = async (): Promise<void> => {
  const TOTAL = 50;
  const ROOTS = 5;
  const MAX_REPLIES_PER_NODE = 50;

  type Node = { id: number; children: number };

  const nodes: Node[] = [];
  const eligibleParentIndexes: number[] = [];

  const addEligibleParent = (nodeIndex: number): void => {
    if ((nodes[nodeIndex]?.children ?? 0) < MAX_REPLIES_PER_NODE) {
      eligibleParentIndexes.push(nodeIndex);
    }
  };

  const createComment = async (
    i: number,
    parentId: number | null,
  ): Promise<number> => {
    const created = await prisma.comment.create({
      data: {
        userName: `user${i}`,
        email: `user${i}@example.com`,
        homePage: null,
        text: `Seed comment #${i}${parentId ? ` (reply to ${parentId})` : ''}`,
        parentId,
      },
      select: { id: true },
    });

    return created.id;
  };

  const rootCount = Math.min(ROOTS, TOTAL);

  for (let i = 1; i <= rootCount; i++) {
    const id = await createComment(i, null);
    addEligibleParent(nodes.push({ id, children: 0 }) - 1);
  }

  for (let i = rootCount + 1; i <= TOTAL; i++) {
    if (eligibleParentIndexes.length === 0) {
      const id = await createComment(i, null);
      addEligibleParent(nodes.push({ id, children: 0 }) - 1);
      continue;
    }

    const pickPos = Math.floor(Math.random() * eligibleParentIndexes.length);
    const parentNodeIndex = eligibleParentIndexes[pickPos];
    if (parentNodeIndex === undefined) {
      throw new Error('Failed to pick eligible parent');
    }

    const parent = nodes[parentNodeIndex];
    if (!parent) {
      throw new Error('Eligible parent index does not exist');
    }

    const id = await createComment(i, parent.id);

    parent.children += 1;

    if (parent.children >= MAX_REPLIES_PER_NODE) {
      eligibleParentIndexes.splice(pickPos, 1);
    }

    addEligibleParent(nodes.push({ id, children: 0 }) - 1);
  }
};

void (async (): Promise<void> => {
  try {
    await seed();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
