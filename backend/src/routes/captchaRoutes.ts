import { Router } from 'express';

import { getCaptcha } from '../controllers/captchaController.js';
import { captchaRateLimiter } from '../middlewares/rateLimiters.js';

const captchaRoutes = Router();

captchaRoutes.get('/', captchaRateLimiter, getCaptcha);

export default captchaRoutes;
