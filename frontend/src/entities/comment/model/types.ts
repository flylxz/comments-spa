import type {
  Comment as ApiComment,
  GetCommentsParams,
  PaginatedCommentsResponse,
  SortField,
  SortOrder,
} from '@comments-spa/shared';

/** Client-side comment with optional sanitized HTML and nested replies. */
export type Comment = Omit<ApiComment, 'replies'> & {
  sanitizedText?: string;
  replies?: Comment[];
};

export type {
  GetCommentsParams,
  PaginatedCommentsResponse,
  SortField,
  SortOrder,
};
