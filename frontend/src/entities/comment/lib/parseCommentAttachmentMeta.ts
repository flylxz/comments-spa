export const getCommentAttachmentFileName = (fileUrl: string): string => {
  const path = (fileUrl.split('?')[0] ?? fileUrl).split('#')[0] ?? fileUrl;
  const lastSlash = path.lastIndexOf('/');
  const name = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;

  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

export const getCommentAttachmentFormat = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');

  if (dotIndex < 0) {
    return '';
  }

  return fileName.slice(dotIndex + 1).toUpperCase();
};

export const formatCommentAttachmentSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
