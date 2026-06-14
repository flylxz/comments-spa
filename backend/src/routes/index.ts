import { Router } from 'express';

import captchaRoutes from './captchaRoutes.js';
import commentRoutes from './commentRoutes.js';

const routes = Router();

routes.use('/captcha', captchaRoutes);
routes.use('/comments', commentRoutes);

export default routes;
