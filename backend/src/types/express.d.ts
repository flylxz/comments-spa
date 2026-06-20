declare global {
  namespace Express {
    interface Request {
      uploadedFileUrl?: string;
      uploadedFileName?: string;
      uploadedFileSize?: number;
    }
  }
}

export {};
