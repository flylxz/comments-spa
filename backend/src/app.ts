import path from 'node:path';
import { fileURLToPath } from 'node:url';

import 'dotenv/config';

import { createServer } from 'node:http';

import express from 'express';
import helmet from 'helmet';

import { errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import { initWebSocket } from './services/websocketService.js';

const app = express();
// One reverse proxy (nginx) in Docker — required for correct req.ip in rate limiters
app.set('trust proxy', 1);
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 3000;
const uploadsPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../uploads',
);

app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use(errorHandler);

initWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
