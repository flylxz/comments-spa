import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import {
  memo,
  type ReactNode,
  startTransition,
  useMemo,
  useState,
} from 'react';

import { countCommentReplies } from '@/entities/comment/lib/countCommentReplies';
import type { Comment } from '@/entities/comment/model/types';
import { Button } from '@/shared/ui/button';

import { CommentCard } from './CommentCard';
import { CommentThreadBranch } from './CommentThreadBranch';

export type CommentTreeProps = {
  comments: Comment[];
  onReplyClick?: (commentId: number) => void;
  replyingToCommentId?: number | null;
  renderReplyForm?: (commentId: number) => ReactNode;
  initialDepth?: number;
};

type SharedTreeProps = Pick<
  CommentTreeProps,
  'onReplyClick' | 'replyingToCommentId' | 'renderReplyForm'
>;

type CommentTreeNodeProps = SharedTreeProps & {
  comments: Comment[];
};

type TopLevelCommentThreadProps = SharedTreeProps & {
  comment: Comment;
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

const isCommentInTree = (root: Comment, targetId: number): boolean => {
  if (root.id === targetId) {
    return true;
  }

  return (
    root.replies?.some((reply) => isCommentInTree(reply, targetId)) ?? false
  );
};

const CommentTreeNode = ({
  comments,
  onReplyClick,
  replyingToCommentId = null,
  renderReplyForm,
}: CommentTreeNodeProps) => (
  <div className="flex flex-col gap-4">
    {comments.map((comment, index) => {
      const isLast = index === comments.length - 1;
      const hasReplies = Boolean(comment.replies?.length);

      return (
        <CommentThreadBranch key={comment.id} isLast={isLast}>
          <div className="flex flex-col gap-4">
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

            {hasReplies ? (
              <CommentTreeNode
                comments={comment.replies ?? []}
                onReplyClick={onReplyClick}
                replyingToCommentId={replyingToCommentId}
                renderReplyForm={renderReplyForm}
              />
            ) : null}
          </div>
        </CommentThreadBranch>
      );
    })}
  </div>
);

const TopLevelCommentThread = ({
  comment,
  onReplyClick,
  replyingToCommentId = null,
  renderReplyForm,
}: TopLevelCommentThreadProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const replyCount = useMemo(() => countCommentReplies(comment), [comment]);
  const hasReplies = replyCount > 0;

  const handleToggleReplies = (): void => {
    startTransition(() => {
      setIsCollapsed((current) => !current);
    });
  };

  return (
    <div className="flex flex-col gap-4">
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

      {hasReplies ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto w-fit gap-1.5 px-1 -ml-1 text-muted-foreground"
          onClick={handleToggleReplies}
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

      {hasReplies && comment.replies ? (
        <div id={`comment-replies-${comment.id}`} hidden={isCollapsed}>
          <CommentTreeNode
            comments={comment.replies}
            onReplyClick={onReplyClick}
            replyingToCommentId={replyingToCommentId}
            renderReplyForm={renderReplyForm}
          />
        </div>
      ) : null}
    </div>
  );
};

const MemoizedTopLevelCommentThread = memo(TopLevelCommentThread);

export const CommentTree = ({
  comments,
  onReplyClick,
  replyingToCommentId = null,
  renderReplyForm,
  initialDepth = 0,
}: CommentTreeProps) => {
  if (initialDepth > 0) {
    return (
      <CommentTreeNode
        comments={comments}
        onReplyClick={onReplyClick}
        replyingToCommentId={replyingToCommentId}
        renderReplyForm={renderReplyForm}
      />
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={treeVariants}
      initial="initial"
      animate="animate"
    >
      {comments.map((comment) => {
        const threadReplyingToCommentId =
          replyingToCommentId !== null &&
          isCommentInTree(comment, replyingToCommentId)
            ? replyingToCommentId
            : null;

        return (
          <MemoizedTopLevelCommentThread
            key={comment.id}
            comment={comment}
            onReplyClick={onReplyClick}
            replyingToCommentId={threadReplyingToCommentId}
            renderReplyForm={renderReplyForm}
          />
        );
      })}
    </motion.div>
  );
};
