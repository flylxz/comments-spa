import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import {
  memo,
  type ReactNode,
  startTransition,
  useCallback,
  useMemo,
} from 'react';

import { countCommentReplies } from '@/entities/comment/lib/countCommentReplies';
import { isCommentInTree } from '@/entities/comment/lib/isCommentInTree';
import { getReplyFormElementId } from '@/entities/comment/lib/scrollToComment';
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
  highlightedCommentId?: number | null;
  collapsedThreadIds?: ReadonlySet<number>;
  onToggleThreadCollapsed?: (topLevelCommentId: number) => void;
};

const EMPTY_COLLAPSED_THREAD_IDS = new Set<number>();

type SharedTreeProps = Pick<
  CommentTreeProps,
  | 'onReplyClick'
  | 'replyingToCommentId'
  | 'renderReplyForm'
  | 'highlightedCommentId'
>;

type CommentTreeNodeProps = SharedTreeProps & {
  comments: Comment[];
};

type TopLevelCommentThreadProps = SharedTreeProps & {
  comment: Comment;
  isRepliesCollapsed: boolean;
  onToggleThreadCollapsed?: (topLevelCommentId: number) => void;
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

type ReplyFormSlotProps = {
  commentId: number;
  renderReplyForm: (commentId: number) => ReactNode;
};

const ReplyFormSlot = ({ commentId, renderReplyForm }: ReplyFormSlotProps) => (
  <motion.div
    id={getReplyFormElementId(commentId)}
    className="scroll-mt-6"
    variants={replyFormVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {renderReplyForm(commentId)}
  </motion.div>
);

const CommentTreeNodeComponent = ({
  comments,
  onReplyClick,
  replyingToCommentId = null,
  renderReplyForm,
  highlightedCommentId = null,
}: CommentTreeNodeProps) => (
  <div className="flex flex-col gap-4">
    {comments.map((comment, index) => {
      const isLast = index === comments.length - 1;
      const hasReplies = Boolean(comment.replies?.length);

      return (
        <CommentThreadBranch key={comment.id} isLast={isLast}>
          <div className="flex flex-col gap-4">
            <CommentCard
              comment={comment}
              onReplyClick={onReplyClick}
              isHighlighted={highlightedCommentId === comment.id}
            />

            <AnimatePresence initial={false}>
              {replyingToCommentId === comment.id && renderReplyForm && (
                <ReplyFormSlot
                  key={`reply-form-${comment.id}`}
                  commentId={comment.id}
                  renderReplyForm={renderReplyForm}
                />
              )}
            </AnimatePresence>

            {hasReplies ? (
              <MemoizedCommentTreeNode
                comments={comment.replies ?? []}
                onReplyClick={onReplyClick}
                replyingToCommentId={replyingToCommentId}
                renderReplyForm={renderReplyForm}
                highlightedCommentId={highlightedCommentId}
              />
            ) : null}
          </div>
        </CommentThreadBranch>
      );
    })}
  </div>
);

const MemoizedCommentTreeNode = memo(CommentTreeNodeComponent);

const TopLevelCommentThread = ({
  comment,
  onReplyClick,
  replyingToCommentId = null,
  renderReplyForm,
  highlightedCommentId = null,
  isRepliesCollapsed,
  onToggleThreadCollapsed,
}: TopLevelCommentThreadProps) => {
  const replyCount = useMemo(() => countCommentReplies(comment), [comment]);
  const hasReplies = replyCount > 0;

  const handleToggleReplies = useCallback((): void => {
    startTransition(() => {
      onToggleThreadCollapsed?.(comment.id);
    });
  }, [onToggleThreadCollapsed, comment.id]);

  return (
    <div className="flex flex-col gap-4">
      <CommentCard
        comment={comment}
        onReplyClick={onReplyClick}
        isHighlighted={highlightedCommentId === comment.id}
      />

      <AnimatePresence initial={false}>
        {replyingToCommentId === comment.id && renderReplyForm && (
          <ReplyFormSlot
            key={`reply-form-${comment.id}`}
            commentId={comment.id}
            renderReplyForm={renderReplyForm}
          />
        )}
      </AnimatePresence>

      {hasReplies ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto w-fit gap-1.5 px-1 -ml-1 text-muted-foreground"
          onClick={handleToggleReplies}
          aria-expanded={!isRepliesCollapsed}
          aria-controls={`comment-replies-${comment.id}`}
        >
          {isRepliesCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
          {isRepliesCollapsed
            ? `Show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
            : `Hide ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
        </Button>
      ) : null}

      {hasReplies && comment.replies ? (
        <div id={`comment-replies-${comment.id}`} hidden={isRepliesCollapsed}>
          <MemoizedCommentTreeNode
            comments={comment.replies}
            onReplyClick={onReplyClick}
            replyingToCommentId={replyingToCommentId}
            renderReplyForm={renderReplyForm}
            highlightedCommentId={highlightedCommentId}
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
  highlightedCommentId = null,
  collapsedThreadIds = EMPTY_COLLAPSED_THREAD_IDS,
  onToggleThreadCollapsed,
}: CommentTreeProps) => {
  if (initialDepth > 0) {
    return (
      <MemoizedCommentTreeNode
        comments={comments}
        onReplyClick={onReplyClick}
        replyingToCommentId={replyingToCommentId}
        renderReplyForm={renderReplyForm}
        highlightedCommentId={highlightedCommentId}
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
            highlightedCommentId={highlightedCommentId}
            isRepliesCollapsed={collapsedThreadIds.has(comment.id)}
            onToggleThreadCollapsed={onToggleThreadCollapsed}
          />
        );
      })}
    </motion.div>
  );
};
