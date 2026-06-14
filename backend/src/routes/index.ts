import { Router } from 'express';

import commentRoutes from './commentRoutes.js';

const routes = Router();

routes.use('/comments', commentRoutes);

export default routes;
