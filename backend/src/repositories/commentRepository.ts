import type {
  Comment,
  PaginatedCommentsQuery,
  PaginatedCommentsResult,
} from '@comments-spa/shared';
import type { PrismaClient } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

const PAGE_SIZE = 25;

interface FlatComment {
  id: number;
  userName: string;
  email: string;
  homePage: string | null;
  text: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  parentId: number | null;
}

export interface CreateCommentRecordInput {
  userName: string;
  email: string;
  homePage: string | null;
  text: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  parentId?: number;
}

const mapToComment = (
  record: FlatComment,
  replies: Comment[] = [],
): Comment => ({
  id: record.id,
  userName: record.userName,
  email: record.email,
  homePage: record.homePage,
  text: record.text,
  fileUrl: record.fileUrl,
  fileName: record.fileName,
  fileSize: record.fileSize,
  createdAt: record.createdAt.toISOString(),
  parentId: record.parentId,
  replies,
});

const buildReplyTree = (
  allReplies: FlatComment[],
  parentId: number,
): Comment[] =>
  allReplies
    .filter((reply) => reply.parentId === parentId)
    .map((reply) => mapToComment(reply, buildReplyTree(allReplies, reply.id)));

const isDescendantOfTopLevel = (
  reply: FlatComment,
  allReplies: FlatComment[],
  topLevelIds: number[],
): boolean => {
  let currentParentId = reply.parentId;

  while (currentParentId !== null) {
    if (topLevelIds.includes(currentParentId)) {
      return true;
    }

    const parent = allReplies.find((item) => item.id === currentParentId);
    if (!parent) {
      return topLevelIds.includes(currentParentId);
    }

    currentParentId = parent.parentId;
  }

  return false;
};

export class CommentRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findTopLevelComments(
    query: PaginatedCommentsQuery,
  ): Promise<PaginatedCommentsResult> {
    const { page, sortBy, sortOrder } = query;
    const skip = (page - 1) * PAGE_SIZE;

    const [total, topLevelComments] = await Promise.all([
      this.db.comment.count({ where: { parentId: null } }),
      this.db.comment.findMany({
        where: { parentId: null },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: PAGE_SIZE,
      }),
    ]);

    if (topLevelComments.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          pageSize: PAGE_SIZE,
          total,
          totalPages: Math.ceil(total / PAGE_SIZE),
        },
      };
    }

    const topLevelIds = topLevelComments.map((comment) => comment.id);

    const allReplies = await this.db.comment.findMany({
      where: {
        parentId: { not: null },
      },
      orderBy: { createdAt: 'asc' },
    });

    const repliesForPage = allReplies.filter((reply) =>
      isDescendantOfTopLevel(reply, allReplies, topLevelIds),
    );

    const data = topLevelComments.map((comment) =>
      mapToComment(comment, buildReplyTree(repliesForPage, comment.id)),
    );

    return {
      data,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    };
  }

  async createCommentRecord(input: CreateCommentRecordInput): Promise<Comment> {
    const { parentId, ...commentData } = input;

    const created = await this.db.comment.create({
      data: {
        ...commentData,
        parentId: parentId ?? null,
      },
    });

    return mapToComment(created);
  }
}

export const commentRepository = new CommentRepository();
