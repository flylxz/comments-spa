declare global {
  namespace Express {
    interface Request {
      uploadedFileUrl?: string;
    }
  }
}

export {};
