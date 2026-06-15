import type { Comment } from '@/entities/comment/model/types';

type CommentNode = Comment & { replies: Comment[] };

/**
 * Builds a nested comment tree from a flat list using O(n) Map lookups.
 * Orphan comments (missing parent) are promoted to root level.
 */
export const buildCommentTree = (flatComments: Comment[]): Comment[] => {
  if (flatComments.length === 0) {
    return [];
  }

  const nodes = new Map<number, CommentNode>();

  for (const { replies: _replies, ...comment } of flatComments) {
    nodes.set(comment.id, { ...comment, replies: [] });
  }

  const roots: Comment[] = [];

  for (const comment of flatComments) {
    const node = nodes.get(comment.id);
    if (!node) {
      continue;
    }

    const { parentId } = comment;

    if (parentId !== null) {
      const parent = nodes.get(parentId);
      if (parent) {
        parent.replies.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  return roots;
};
