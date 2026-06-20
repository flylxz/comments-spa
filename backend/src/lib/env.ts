export const isProduction = (): boolean =>
  process.env.NODE_ENV === 'production';

export const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwtSecret;
};
