import { z } from 'zod';

const optionalUrl = z
  .string()
  .optional()
  .transform((value) =>
    typeof value === 'string' && value.length > 0 ? value : undefined,
  )
  .pipe(z.string().url().optional());

const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .optional()
    .transform((value) =>
      typeof value === 'string' && value.length > 0 ? value : '/api',
    )
    .pipe(z.string().url().or(z.string().startsWith('/'))),
  VITE_API_ORIGIN: optionalUrl,
});

/** Strips the `/api` suffix to derive the server origin for static assets. */
const deriveApiOrigin = (apiUrl: string): string =>
  apiUrl.replace(/\/api\/?$/, '');

const parsedEnv = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_ORIGIN: import.meta.env.VITE_API_ORIGIN,
});

/** Runtime configuration validated with Zod at module load. */
export const env = {
  apiUrl: parsedEnv.VITE_API_URL,
  apiOrigin:
    parsedEnv.VITE_API_ORIGIN ?? deriveApiOrigin(parsedEnv.VITE_API_URL),
} as const;
