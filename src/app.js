import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurations & Middlewares
import env from './config/env.js';
import loggerMiddleware from './middlewares/logger.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import rateLimiter from './middlewares/rateLimiter.middleware.js';
import apiRouter from './routes/index.js';
import ApiError from './utils/ApiError.js';

// Setup file paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Premium Security Hardeners
app.use(helmet());
app.use(
  cors({
    origin: '*', // Customize this with specific domains in production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(hpp()); // HTTP Parameter Pollution protection
app.use('/api', rateLimiter); // Apply rate limiter to API routes only

// 2. Parsers & Logger Interceptors
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(loggerMiddleware); // Winston Request logger

// 3. Static Assets Serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 4. Centralized Application Routing
app.use('/api/v1', apiRouter);

// 5. Catch-All Route 404 Handler
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot find route '${req.method} ${req.originalUrl}' on this server.`));
});

// 6. Central Global Error Handling Middleware
app.use(errorMiddleware);

export default app;
export { app };
