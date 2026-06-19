import { AnimatePresence, motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

import type { Comment } from '@/entities/comment/model/types';
import { cn } from '@/shared/lib/utils';

import { CommentCard } from './CommentCard';

export type CommentTreeProps = {
  comments: Comment[];
  onReplyClick?: (commentId: number) => void;
  replyingToCommentId?: number | null;
  renderReplyForm?: (commentId: number) => ReactNode;
  depth?: number;
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

export const CommentTree = ({
  comments,
  onReplyClick,
  replyingToCommentId = null,
  renderReplyForm,
  depth = 0,
}: CommentTreeProps) => (
  <motion.div
    className="flex flex-col gap-4"
    variants={treeVariants}
    initial="initial"
    animate="animate"
  >
    {comments.map((comment) => (
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

        {comment.replies && comment.replies.length > 0 ? (
          <div
            className={cn(
              'border-l border-border',
              depth > 5 ? 'pl-0' : 'pl-6',
            )}
          >
            <CommentTree
              comments={comment.replies}
              onReplyClick={onReplyClick}
              replyingToCommentId={replyingToCommentId}
              renderReplyForm={renderReplyForm}
              depth={depth + 1}
            />
          </div>
        ) : null}
      </div>
    ))}
  </motion.div>
);
