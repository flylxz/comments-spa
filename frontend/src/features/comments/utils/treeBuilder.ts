import type { Comment } from '@/features/comments/types/comment';

/**
 * Converts a nested comment tree into a flat list.
 * Use before merging WebSocket payloads or rebuilding the tree client-side.
 */
export const flattenCommentTree = (tree: readonly Comment[]): Comment[] => {
  const flat: Comment[] = [];

  const visit = (comments: readonly Comment[]): void => {
    for (const { replies, ...comment } of comments) {
      flat.push(comment);
      if (replies.length > 0) {
        visit(replies);
      }
    }
  };

  visit(tree);

  return flat;
};

/**
 * Builds a nested tree from a flat comment list.
 * GET /comments already returns a tree from the API — use this utility for
 * client-side merges (e.g. WebSocket `comments:new` events).
 */
export const buildCommentTree = (
  flatComments: readonly Comment[],
): Comment[] => {
  if (flatComments.length === 0) {
    return [];
  }

  const nodes = new Map<number, Comment>();

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

    if (parentId !== null && nodes.has(parentId)) {
      nodes.get(parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

/**
 * Appends a flat comment (e.g. from WebSocket) into an existing tree.
 */
export const appendCommentToTree = (
  tree: readonly Comment[],
  comment: Comment,
): Comment[] => {
  const flat = flattenCommentTree(tree);

  return buildCommentTree([...flat, { ...comment, replies: [] }]);
};
