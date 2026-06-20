export interface Comment {
  id: number;
  userName: string;
  email: string;
  homePage: string | null;
  text: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
  parentId: number | null;
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

export interface CommentSortField {
  field: 'userName' | 'email' | 'createdAt';
  order: 'asc' | 'desc';
}

export interface PaginatedCommentsQuery {
  page: number;
  sortBy: CommentSortField['field'];
  sortOrder: CommentSortField['order'];
}

export interface PaginatedCommentsResult {
  data: Comment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
