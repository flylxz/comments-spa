import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import sharp from 'sharp';

import { FieldValidationError } from '../errors/fieldValidationError.js';

const MAX_TXT_SIZE_BYTES = 100 * 1024;
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 320;
const MAX_IMAGE_HEIGHT = 240;

const ALLOWED_IMAGE_FORMATS = new Set(['jpeg', 'png', 'gif']);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.gif', '.png', '.txt']);

const UPLOADS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../uploads',
);

const MULTER_ERROR_MESSAGES: Partial<Record<MulterError['code'], string>> = {
  LIMIT_FILE_SIZE: 'File size must not exceed 5 MB',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Use "file" field name',
};

const memoryStorage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    !ALLOWED_MIME_TYPES.has(file.mimetype) ||
    !ALLOWED_EXTENSIONS.has(extension)
  ) {
    callback(
      new FieldValidationError(
        'file',
        'Allowed formats: JPG, JPEG, GIF, PNG, TXT',
      ),
    );
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
}).single('file');

export const handleUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  upload(req, res, (error: unknown) => {
    if (error instanceof MulterError) {
      next(
        new FieldValidationError(
          'file',
          MULTER_ERROR_MESSAGES[error.code] ?? error.message,
        ),
      );
      return;
    }

    if (error) {
      next(error);
      return;
    }

    next();
  });
};

const buildUniqueFilename = (extension: string): string =>
  `${crypto.randomUUID()}${extension}`;

const sanitizeOriginalFileName = (originalName: string): string => {
  const baseName = path.basename(originalName).replace(/[\0\r\n]/g, '');

  return baseName.slice(0, 255) || 'attachment';
};

const saveTextFile = async (
  buffer: Buffer,
  extension: string,
): Promise<string> => {
  if (buffer.length > MAX_TXT_SIZE_BYTES) {
    throw new FieldValidationError(
      'file',
      'TXT file size must not exceed 100 KB',
    );
  }

  const filename = buildUniqueFilename(extension);
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return `/uploads/${filename}`;
};

const saveImageFile = async (
  buffer: Buffer,
  extension: string,
): Promise<string> => {
  let image: ReturnType<typeof sharp>;
  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>;

  try {
    image = sharp(buffer);
    metadata = await image.metadata();
  } catch {
    throw new FieldValidationError('file', 'Invalid image file');
  }

  if (
    metadata.format === undefined ||
    !ALLOWED_IMAGE_FORMATS.has(metadata.format)
  ) {
    throw new FieldValidationError('file', 'Invalid image file');
  }

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const filename = buildUniqueFilename(extension);
  const outputPath = path.join(UPLOADS_DIR, filename);

  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
    await image
      .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(outputPath);
  } else {
    await fs.writeFile(outputPath, buffer);
  }

  return `/uploads/${filename}`;
};

export const processUploadedFile = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      next();
      return;
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const isTextFile = extension === '.txt';

    req.uploadedFileUrl = isTextFile
      ? await saveTextFile(req.file.buffer, extension)
      : await saveImageFile(req.file.buffer, extension);
    req.uploadedFileName = sanitizeOriginalFileName(req.file.originalname);
    req.uploadedFileSize = req.file.buffer.length;

    next();
  } catch (error) {
    next(error);
  }
};
