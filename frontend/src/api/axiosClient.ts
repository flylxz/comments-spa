import axios from 'axios';

import { env } from '@/config/env';

/** Shared Axios instance for all API requests. */
export const axiosClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    Accept: 'application/json',
  },
});
