export interface Comment {
  id: string;
  userName: string;
  email: string;
  homePage: string | null;
  captchaId: string;
  text: string;
  createdAt: string;
}

export interface CreateCommentInput {
  userName: string;
  email: string;
  homePage?: string | null;
  captchaId: string;
  text: string;
}
