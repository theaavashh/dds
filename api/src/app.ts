import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import routes
import { registerRoutes } from './routes';
import logger from './utils/logger';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import {
  securityMiddleware,
  enhancedSecurityMiddleware,
  authRateLimiter
} from './middleware/securityMiddleware';
import { csrfValidate } from './middleware/csrfMiddleware';

// Load environment variables
dotenv.config();

const app = express();

/**
 * Configure standard middleware
 */
const configureMiddleware = () => {
  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [
      'http://localhost:6001',
      'http://localhost:9000',
      'http://localhost:3003',
      'http://localhost:3004'
    ];

  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'x-csrf-token', 'x-api-key', 'x-signature', 'x-timestamp']
  }));

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: false
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Static files and compression
  app.use(compression());
  app.use('/uploads', express.static('uploads'));

  // Logging
  const isDev = process.env.NODE_ENV === 'development';
  app.use(morgan(isDev ? 'dev' : 'combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }));
};

/**
 * Configure custom security middleware (Rate Limiting, CSRF)
 */
const configureSecurity = () => {
  // Environment-based security
  if (process.env.NODE_ENV === 'development') {
    app.use('/api', securityMiddleware);
  } else {
    app.use('/api', enhancedSecurityMiddleware);
  }

  // Rate limiters for auth endpoints
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/register', authRateLimiter);
  app.use('/api/auth/forgot-password', authRateLimiter);

  // CSRF Protection
  app.use(csrfValidate);
};

// Initialize Application
configureMiddleware();
configureSecurity();

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Register Business Routes
registerRoutes(app);

// Error Handling (Must be last)
app.use(notFound);
app.use(errorHandler);

export default app;