import { useQueryClient } from '@tanstack/react-query';
import { motion, type Variants } from 'motion/react';
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  startTransition,
  useCallback,
  useRef,
  useState,
} from 'react';

import type {
  Comment,
  GetCommentsParams,
  PaginatedCommentsResponse,
} from '@/entities/comment';
import { commentQueryKeys } from '@/entities/comment/api/queryKeys';
import { findTopLevelCommentId } from '@/entities/comment/lib/findTopLevelCommentId';
import { normalizeCommentTree } from '@/entities/comment/lib/normalizeCommentTree';
import { CommentForm } from '@/features/manage-comments';

import { CommentsListRegion } from './CommentsListRegion';

const sectionVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

type UseCommentCreatedHandlerParams = {
  queryParams: GetCommentsParams;
  setQueryParams: Dispatch<SetStateAction<GetCommentsParams>>;
  skipNextPageScrollRef: RefObject<boolean>;
  handleEnsureThreadExpanded: (topLevelCommentId: number) => void;
  setReplyingToCommentId: Dispatch<SetStateAction<number | null>>;
  setHighlightedCommentId: Dispatch<SetStateAction<number | null>>;
};

const useCommentCreatedHandler = ({
  queryParams,
  setQueryParams,
  skipNextPageScrollRef,
  handleEnsureThreadExpanded,
  setReplyingToCommentId,
  setHighlightedCommentId,
}: UseCommentCreatedHandlerParams) => {
  const queryClient = useQueryClient();

  return useCallback(
    async (comment: Comment): Promise<void> => {
      setReplyingToCommentId(null);

      let paramsForLookup = queryParams;

      if (comment.parentId === null && queryParams.page !== 1) {
        paramsForLookup = { ...queryParams, page: 1 };
        skipNextPageScrollRef.current = true;
        setQueryParams(paramsForLookup);
      }

      await queryClient.refetchQueries({ queryKey: commentQueryKeys.all });

      const listData = queryClient.getQueryData<PaginatedCommentsResponse>(
        commentQueryKeys.list(paramsForLookup),
      );

      if (listData !== undefined) {
        const tree = normalizeCommentTree(listData.data);
        const rootId = findTopLevelCommentId(tree, comment.id);

        if (rootId !== null) {
          handleEnsureThreadExpanded(rootId);
        }
      }

      setHighlightedCommentId(comment.id);
    },
    [
      queryClient,
      queryParams,
      setQueryParams,
      skipNextPageScrollRef,
      handleEnsureThreadExpanded,
      setReplyingToCommentId,
      setHighlightedCommentId,
    ],
  );
};

export const CommentSection = () => {
  const [queryParams, setQueryParams] = useState<GetCommentsParams>({
    page: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
    null,
  );
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    number | null
  >(null);
  const [collapsedThreadIds, setCollapsedThreadIds] = useState<
    ReadonlySet<number>
  >(() => new Set());
  const skipNextPageScrollRef = useRef(false);

  const handleReplyClick = useCallback((commentId: number): void => {
    startTransition(() => {
      setReplyingToCommentId((current) =>
        current === commentId ? null : commentId,
      );
    });
  }, []);

  const handleHighlightComplete = useCallback((): void => {
    setHighlightedCommentId(null);
  }, []);

  const handleToggleThreadCollapsed = useCallback(
    (topLevelCommentId: number): void => {
      setCollapsedThreadIds((current) => {
        const next = new Set(current);

        if (next.has(topLevelCommentId)) {
          next.delete(topLevelCommentId);
        } else {
          next.add(topLevelCommentId);
        }

        return next;
      });
    },
    [],
  );

  const handleEnsureThreadExpanded = useCallback(
    (topLevelCommentId: number): void => {
      setCollapsedThreadIds((current) => {
        if (!current.has(topLevelCommentId)) {
          return current;
        }

        const next = new Set(current);
        next.delete(topLevelCommentId);
        return next;
      });
    },
    [],
  );

  const handleCommentCreated = useCommentCreatedHandler({
    queryParams,
    setQueryParams,
    skipNextPageScrollRef,
    handleEnsureThreadExpanded,
    setReplyingToCommentId,
    setHighlightedCommentId,
  });

  return (
    <motion.section
      variants={sectionVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-8"
    >
      <CommentForm parentId={null} onSuccess={handleCommentCreated} />
      <CommentsListRegion
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        replyingToCommentId={replyingToCommentId}
        onReplyClick={handleReplyClick}
        highlightedCommentId={highlightedCommentId}
        onHighlightComplete={handleHighlightComplete}
        collapsedThreadIds={collapsedThreadIds}
        onToggleThreadCollapsed={handleToggleThreadCollapsed}
        onCommentCreated={handleCommentCreated}
        skipNextPageScrollRef={skipNextPageScrollRef}
        onEnsureThreadExpanded={handleEnsureThreadExpanded}
      />
    </motion.section>
  );
};
