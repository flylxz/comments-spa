/** Reads a Vite env variable or returns the provided fallback. */
const getRequiredEnv = (key: keyof ImportMetaEnv, fallback: string): string => {
  const value = import.meta.env[key];

  return typeof value === 'string' && value.length > 0 ? value : fallback;
};

/** Reads an optional Vite env variable. */
const getOptionalEnv = (key: keyof ImportMetaEnv): string | undefined => {
  const value = import.meta.env[key];

  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

/** Strips the `/api` suffix to derive the server origin for static assets. */
const deriveApiOrigin = (apiUrl: string): string =>
  apiUrl.replace(/\/api\/?$/, '');

const apiUrl = getRequiredEnv('VITE_API_URL', 'http://localhost:3000/api');

/** Runtime configuration sourced from Vite environment variables. */
export const env = {
  apiUrl,
  /** Origin for static uploads; used by resolveFileUrl. */
  apiOrigin: getOptionalEnv('VITE_API_ORIGIN') ?? deriveApiOrigin(apiUrl),
} as const;
