import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { type ReactNode, useState } from 'react';

import { countCommentReplies } from '@/entities/comment/lib/countCommentReplies';
import type { Comment } from '@/entities/comment/model/types';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

import { CommentCard } from './CommentCard';

export type CommentTreeProps = {
  comments: Comment[];
  onReplyClick?: (commentId: number) => void;
  replyingToCommentId?: number | null;
  renderReplyForm?: (commentId: number) => ReactNode;
  depth?: number;
};

type CommentTreeNodeProps = CommentTreeProps & {
  collapsedIds: Set<number>;
  onToggleReplies: (commentId: number) => void;
};

const treeVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const replyFormVariants: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const CommentTreeNode = ({
  comments,
  onReplyClick,
  replyingToCommentId = null,
  renderReplyForm,
  depth = 0,
  collapsedIds,
  onToggleReplies,
}: CommentTreeNodeProps) => (
  <motion.div
    className="flex flex-col gap-4"
    variants={treeVariants}
    initial="initial"
    animate="animate"
  >
    {comments.map((comment) => {
      const replyCount = countCommentReplies(comment);
      const hasReplies = replyCount > 0;
      const isTopLevel = depth === 0;
      const isCollapsed = isTopLevel && collapsedIds.has(comment.id);
      const showReplies = hasReplies && comment.replies && !isCollapsed;

      return (
        <div key={comment.id} className="flex flex-col gap-4">
          <CommentCard comment={comment} onReplyClick={onReplyClick} />

          <AnimatePresence initial={false}>
            {replyingToCommentId === comment.id && renderReplyForm ? (
              <motion.div
                key={`reply-form-${comment.id}`}
                variants={replyFormVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {renderReplyForm(comment.id)}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {isTopLevel && hasReplies ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto w-fit gap-1.5 px-1 -ml-1 text-muted-foreground"
              onClick={() => onToggleReplies(comment.id)}
              aria-expanded={!isCollapsed}
              aria-controls={`comment-replies-${comment.id}`}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
              {isCollapsed
                ? `Show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                : `Hide ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
            </Button>
          ) : null}

          {showReplies ? (
            <div
              id={isTopLevel ? `comment-replies-${comment.id}` : undefined}
              className={cn(
                'border-l border-border',
                depth > 5 ? 'pl-0' : 'pl-6',
              )}
            >
              <CommentTreeNode
                comments={comment.replies || []}
                onReplyClick={onReplyClick}
                replyingToCommentId={replyingToCommentId}
                renderReplyForm={renderReplyForm}
                depth={depth + 1}
                collapsedIds={collapsedIds}
                onToggleReplies={onToggleReplies}
              />
            </div>
          ) : null}
        </div>
      );
    })}
  </motion.div>
);

export const CommentTree = ({
  comments,
  onReplyClick,
  replyingToCommentId = null,
  renderReplyForm,
}: CommentTreeProps) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(
    () => new Set(),
  );

  const handleToggleReplies = (commentId: number): void => {
    setCollapsedIds((current) => {
      const next = new Set(current);

      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }

      return next;
    });
  };

  return (
    <CommentTreeNode
      comments={comments}
      onReplyClick={onReplyClick}
      replyingToCommentId={replyingToCommentId}
      renderReplyForm={renderReplyForm}
      collapsedIds={collapsedIds}
      onToggleReplies={handleToggleReplies}
    />
  );
};
