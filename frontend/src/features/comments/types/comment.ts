/** Core comment entity aligned with the backend model. */
export interface Comment {
  id: number;
  userName: string;
  email: string;
  homePage: string | null;
  text: string;
  fileUrl: string | null;
  parentId: number | null;
  createdAt: string;
  replies: Comment[];
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

/** Payload for POST /comments (file sent as multipart field). */
export type CreateCommentPayload = {
  userName: string;
  email: string;
  homePage?: string | null;
  captchaId: string;
  captchaAnswer: string;
  text: string;
  parentId?: number;
  file?: File;
};

/** Response from GET /captcha. */
export type CaptchaResponse = {
  captchaSvg: string;
  captchaId: string;
};
