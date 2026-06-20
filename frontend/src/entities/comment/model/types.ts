/** Core comment entity aligned with the backend model. */
export interface Comment {
  id: number;
  userName: string;
  email: string;
  homePage?: string;
  text: string;
  /** Client-side sanitized HTML; set by normalizeCommentTree before render. */
  sanitizedText?: string;
  fileUrl?: string;
  fileName?: string | null;
  fileSize?: number | null;
  parentId: number | null;
  createdAt: string;
  replies?: Comment[];
}

export type SortField = 'createdAt' | 'userName' | 'email';
export type SortOrder = 'asc' | 'desc';

/** Query params for GET /comments. */
export type GetCommentsParams = {
  page: number;
  sortBy: SortField;
  sortOrder: SortOrder;
};

/** Paginated response from GET /comments. */
export type PaginatedCommentsResponse = {
  data: Comment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
