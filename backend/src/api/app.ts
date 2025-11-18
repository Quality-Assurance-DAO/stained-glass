import express, { Express } from 'express';
import corsMiddleware from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from '../utils/logger';
import { env } from '../config/env';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Health check endpoint
import healthRouter from './routes/health';
app.use('/health', healthRouter);

// API routes will be added here
// app.use('/v1/churches', churchesRouter);
// app.use('/v1/windows', windowsRouter);
// app.use('/v1/submissions', submissionsRouter);
// app.use('/v1/users', usersRouter);
// app.use('/v1/blockchain', blockchainRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

export default app;

