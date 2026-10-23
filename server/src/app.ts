import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

export const createApp = (): Express => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const configuredOrigins = [
    ENV.FRONTEND_URL,
    ENV.CLIENT_URL,
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .flatMap(u => (u as string).split(','))
    .map(u => u.trim().replace(/\/+$/, ''));

  const staticAllowedOrigins = new Set([
    ...configuredOrigins,
    'https://placement-vault.netlify.app',
    'https://placementvault.netlify.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ]);

  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Allow server-to-server or tools without origin header (e.g. curl, postman)
        if (!requestOrigin) return callback(null, true);

        const cleanOrigin = requestOrigin.replace(/\/+$/, '');
        if (
          staticAllowedOrigins.has(cleanOrigin) ||
          cleanOrigin.endsWith('.netlify.app') ||
          cleanOrigin.endsWith('.onrender.com') ||
          cleanOrigin.includes('localhost') ||
          cleanOrigin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }

        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'PlacementVault API',
      timestamp: new Date().toISOString(),
    });
  });

  // Rate Limiting
  app.use('/api', apiRateLimiter);

  // Mount API v1 Routes
  app.use('/api/v1', apiRouter);

  // 404 handler for undefined routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'The requested API route does not exist.',
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
