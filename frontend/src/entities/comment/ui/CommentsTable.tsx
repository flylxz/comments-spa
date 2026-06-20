import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  CornerUpLeft,
  Hash,
} from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { type ReactNode, useState } from 'react';

import { countCommentReplies } from '@/entities/comment/lib/countCommentReplies';
import { formatCommentDate } from '@/entities/comment/lib/formatCommentDate';
import { sanitizeCommentHtml } from '@/entities/comment/lib/sanitizeCommentHtml';
import type {
  Comment,
  SortField,
  SortOrder,
} from '@/entities/comment/model/types';
import { CommentAttachment } from '@/entities/comment/ui/CommentAttachment';
import { CommentTree } from '@/entities/comment/ui/CommentTree';
import {
  interactiveIconButton,
  interactiveSortTrigger,
  interactiveSortTriggerActive,
  interactiveTableRow,
  interactiveTextLink,
} from '@/shared/lib/interactiveStyles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export type CommentsTableProps = {
  comments: Comment[];
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  isFetching?: boolean;
  replyingToCommentId: number | null;
  onReplyClick: (commentId: number) => void;
  renderReplyForm: (commentId: number) => ReactNode;
};

type SortableColumn = {
  field: SortField;
  label: string;
};

const SORTABLE_COLUMNS: SortableColumn[] = [
  { field: 'userName', label: 'User Name' },
  { field: 'email', label: 'E-mail' },
  { field: 'createdAt', label: 'Date' },
];

const replyFormVariants: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const commentTextClassName =
  'whitespace-pre-line leading-relaxed [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_p+p]:mt-2';

const normalizeHomePageUrl = (homePage: string): string =>
  /^https?:\/\//i.test(homePage) ? homePage : `https://${homePage}`;

const SortIcon = ({
  field,
  sortBy,
  sortOrder,
}: {
  field: SortField;
  sortBy: SortField;
  sortOrder: SortOrder;
}) => {
  if (field !== sortBy) {
    return (
      <ArrowUp
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
        aria-hidden
      />
    );
  }

  return sortOrder === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
  );
};

const SortableHeader = ({
  field,
  label,
  sortBy,
  sortOrder,
  onSortChange,
}: SortableColumn & {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
}) => (
  <th scope="col" className="px-4 py-3 text-left font-medium text-foreground">
    <button
      type="button"
      aria-pressed={field === sortBy}
      onClick={() => onSortChange(field)}
      className={cn(
        interactiveSortTrigger,
        field === sortBy && interactiveSortTriggerActive,
      )}
    >
      {label}
      {field === sortBy ? (
        <span className="sr-only">
          {`, sorted ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
        </span>
      ) : null}
      <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />
    </button>
  </th>
);

export const CommentsTable = ({
  comments,
  sortBy,
  sortOrder,
  onSortChange,
  isFetching = false,
  replyingToCommentId,
  onReplyClick,
  renderReplyForm,
}: CommentsTableProps) => (
  <div
    className={cn(
      'overflow-x-auto rounded-lg border border-border',
      isFetching && 'pointer-events-none opacity-60',
    )}
  >
    <table className="w-full min-w-[640px] table-fixed border-collapse text-sm">
      <caption className="sr-only">Comments list</caption>
      <colgroup>
        <col className="w-[20%]" />
        <col className="w-[24%]" />
        <col className="w-[18%]" />
        <col className="w-[38%]" />
      </colgroup>
      <thead>
        <tr className="border-b border-border bg-muted/50">
          {SORTABLE_COLUMNS.map((column) => (
            <SortableHeader
              key={column.field}
              {...column}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
          ))}
          <th
            scope="col"
            className="px-4 py-3 text-left font-medium text-foreground"
          >
            Text
          </th>
        </tr>
      </thead>
      {comments.map((comment) => (
        <CommentTableThread
          key={comment.id}
          comment={comment}
          replyingToCommentId={replyingToCommentId}
          onReplyClick={onReplyClick}
          renderReplyForm={renderReplyForm}
        />
      ))}
    </table>
  </div>
);

type CommentTableThreadProps = {
  comment: Comment;
  replyingToCommentId: number | null;
  onReplyClick: (commentId: number) => void;
  renderReplyForm: (commentId: number) => ReactNode;
};

const CommentTableThread = ({
  comment,
  replyingToCommentId,
  onReplyClick,
  renderReplyForm,
}: CommentTableThreadProps) => {
  const replyCount = countCommentReplies(comment);
  const hasReplies = replyCount > 0;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isTopLevelReplyFormOpen = replyingToCommentId === comment.id;
  const showReplyCards = hasReplies && !isCollapsed;

  const handleToggleReplies = (): void => {
    setIsCollapsed((current) => !current);
  };

  const handleTopLevelReplyClick = (): void => {
    if (hasReplies) {
      setIsCollapsed(false);
    }

    onReplyClick(comment.id);
  };

  return (
    <tbody className="border-b-2 border-border">
      <TopLevelCommentRow
        comment={comment}
        onReplyClick={handleTopLevelReplyClick}
        replyCount={replyCount}
        isCollapsed={isCollapsed}
        onToggleReplies={hasReplies ? handleToggleReplies : undefined}
      />

      <AnimatePresence initial={false}>
        {isTopLevelReplyFormOpen ? (
          <tr>
            <td
              colSpan={4}
              className="border-b border-border bg-muted/20 px-4 py-4"
            >
              <motion.div
                key={`reply-form-${comment.id}`}
                variants={replyFormVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {renderReplyForm(comment.id)}
              </motion.div>
            </td>
          </tr>
        ) : null}
      </AnimatePresence>

      {showReplyCards ? (
        <tr>
          <td
            colSpan={4}
            className="border-b border-border bg-muted/10 px-4 py-4"
          >
            <CommentTree
              comments={comment.replies ?? []}
              initialDepth={1}
              replyingToCommentId={replyingToCommentId}
              onReplyClick={onReplyClick}
              renderReplyForm={renderReplyForm}
            />
          </td>
        </tr>
      ) : null}
    </tbody>
  );
};

type TopLevelCommentRowProps = {
  comment: Comment;
  onReplyClick: () => void;
  replyCount: number;
  isCollapsed: boolean;
  onToggleReplies?: () => void;
};

const TopLevelCommentRow = ({
  comment,
  onReplyClick,
  replyCount,
  isCollapsed,
  onToggleReplies,
}: TopLevelCommentRowProps) => (
  <tr
    id={`comment-${comment.id}`}
    className={cn('border-b border-border align-top', interactiveTableRow)}
  >
    <th
      scope="row"
      className="max-w-0 px-4 py-3 text-left font-medium text-foreground"
    >
      <CommentUserName comment={comment} />
    </th>
    <td className="max-w-0 px-4 py-3 text-muted-foreground">
      <a
        href={`mailto:${comment.email}`}
        title={comment.email}
        className={cn('block truncate', interactiveTextLink)}
      >
        {comment.email}
      </a>
    </td>
    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
      <time dateTime={comment.createdAt}>
        {formatCommentDate(comment.createdAt)}
      </time>
    </td>
    <td className="px-4 py-3 text-foreground">
      <div
        className={commentTextClassName}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized with DOMPurify before rendering
        dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(comment.text) }}
      />

      {comment.fileUrl ? (
        <div className="mt-3">
          <CommentAttachment
            commentId={comment.id}
            fileUrl={comment.fileUrl}
            fileName={comment.fileName}
            fileSize={comment.fileSize}
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-1.5 px-1 -ml-1 text-muted-foreground"
          onClick={onReplyClick}
        >
          <CornerUpLeft className="h-4 w-4" />
          Reply
        </Button>

        <a
          href={`#comment-${comment.id}`}
          className={interactiveIconButton}
          aria-label="Permalink"
        >
          <Hash className="h-4 w-4" />
        </a>

        {onToggleReplies && replyCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto gap-1.5 px-2 text-muted-foreground"
            onClick={onToggleReplies}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
            {isCollapsed
              ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
              : 'Hide replies'}
          </Button>
        ) : null}
      </div>
    </td>
  </tr>
);

type CommentUserNameProps = {
  comment: Comment;
};

const CommentUserName = ({ comment }: CommentUserNameProps) => {
  if (comment.homePage) {
    return (
      <a
        href={normalizeHomePageUrl(comment.homePage)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('block truncate', interactiveTextLink)}
      >
        {comment.userName}
      </a>
    );
  }

  return <span className="block truncate">{comment.userName}</span>;
};
