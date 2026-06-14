import { Router } from 'express';

import { getCaptcha } from '../controllers/captchaController.js';

const captchaRoutes = Router();

captchaRoutes.get('/', getCaptcha);

export default captchaRoutes;
