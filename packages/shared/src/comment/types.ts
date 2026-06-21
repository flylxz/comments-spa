export interface Comment {
  id: number;
  userName: string;
  email: string;
  homePage: string | null;
  text: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  parentId: number | null;
  createdAt: string;
  replies: Comment[];
}

export interface CreateCommentInput {
  userName: string;
  email: string;
  homePage?: string | null;
  captchaId: string;
  captchaAnswer: string;
  text: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  parentId?: number;
}

export type CommentSortField = 'userName' | 'email' | 'createdAt';
export type CommentSortOrder = 'asc' | 'desc';

export type SortField = CommentSortField;
export type SortOrder = CommentSortOrder;

export type PaginatedCommentsQuery = {
  page: number;
  sortBy: CommentSortField;
  sortOrder: CommentSortOrder;
};

export type GetCommentsParams = PaginatedCommentsQuery;

export type PaginatedCommentsResult = {
  data: Comment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type PaginatedCommentsResponse = PaginatedCommentsResult;

export interface CommentSortFieldConfig {
  field: CommentSortField;
  order: CommentSortOrder;
}
