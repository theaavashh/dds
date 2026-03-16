import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

// Allowed origins for your applications
const ALLOWED_ORIGINS = [
  'http://localhost:6001', // Admin
  'http://localhost:9000', // Frontend
  'http://localhost:3003', // Additional frontend
  'http://localhost:3004', // Additional frontend
];

// In production, replace with your actual domains
const PRODUCTION_ORIGINS = [
  'https://admin.yourdomain.com',
  'https://www.yourdomain.com',
  'https://yourdomain.com',
];

// API Keys for your applications
const API_KEYS = {
  admin: process.env.ADMIN_API_KEY || 'admin_secure_key_2024_change_me',
  frontend: process.env.FRONTEND_API_KEY || 'frontend_secure_key_2024_change_me',
};

// User-Agent patterns for your applications
const ALLOWED_USER_AGENTS = [
  /Mozilla\/5\.0.*Chrome\/.*/,
  /Mozilla\/5\.0.*Firefox\/.*/,
  /Mozilla\/5\.0.*Safari\/.*/,
  /Mozilla\/5\.0.*Edg\/.*/,
  /^curl\/.*/,
];

/**
 * Reusable helper to determine if a path should bypass security checks
 * Only used for non-essential checks or initial handshake
 */
const isPublicPath = (req: Request): boolean => {
  const url = req.originalUrl;
  return url === '/health' || url === '/api/health';
};

/**
 * Enhanced rate limiting for different endpoints
 */
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
      res.status(429).json({ error: message });
    },
  });
};

export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  process.env.NODE_ENV === 'development' ? 100 : 10,
  'Too many authentication attempts, please try again later.'
);

export const generalRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  process.env.NODE_ENV === 'development' ? 1000 : 100,
  'Too many requests, please try again later.'
);

/**
 * API Key validation middleware
 * Allows bypassing for whitelisted browser origins
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  if (isPublicPath(req)) return next();

  // Check if request is from a whitelisted origin
  const origin = req.headers.origin;
  const allowedOrigins = process.env.NODE_ENV === 'production' ? PRODUCTION_ORIGINS : ALLOWED_ORIGINS;

  if (origin && allowedOrigins.includes(origin)) {
    // Trusted browser origin - bypass static API key check
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    logger.warn(`Missing API key for IP: ${req.ip}`);
    return res.status(401).json({
      error: 'API key required',
      message: 'This API is restricted to authorized applications or whitelisted browser origins.'
    });
  }

  const validApiKey = Object.values(API_KEYS).includes(apiKey);
  if (!validApiKey) {
    logger.warn(`Invalid API key for IP: ${req.ip}`);
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid.'
    });
  }

  next();
};

/**
 * Origin validation middleware
 */
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  if (isPublicPath(req)) return next();

  const origin = req.headers.origin;
  const allowedOrigins = process.env.NODE_ENV === 'production' ? PRODUCTION_ORIGINS : ALLOWED_ORIGINS;

  if (origin && !allowedOrigins.includes(origin)) {
    logger.warn(`Unauthorized origin: ${origin} for IP: ${req.ip}`);
    return res.status(403).json({
      error: 'Origin not allowed',
      message: 'Access from this origin is not permitted.'
    });
  }

  next();
};

/**
 * User-Agent validation middleware
 */
export const validateUserAgent = (req: Request, res: Response, next: NextFunction) => {
  if (isPublicPath(req)) return next();

  const userAgent = req.get('User-Agent');

  if (!userAgent) {
    return res.status(403).json({
      error: 'Invalid request',
      message: 'Requests must include a valid User-Agent header.'
    });
  }

  const isValidBrowser = ALLOWED_USER_AGENTS.some(pattern => pattern.test(userAgent));

  if (!isValidBrowser) {
    logger.warn(`Invalid User-Agent blocked: ${userAgent} for IP: ${req.ip}`);
    return res.status(403).json({
      error: 'Invalid browser',
      message: 'Access from this browser is not permitted.'
    });
  }

  next();
};

/**
 * IP-based security middleware
 */
export const validateIP = (req: Request, res: Response, next: NextFunction) => {
  if (isPublicPath(req)) return next();

  const clientIP = req.ip || req.connection.remoteAddress;
  const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];

  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP as string)) {
    logger.warn(`Unauthorized IP blocked: ${clientIP}`);
    return res.status(403).json({
      error: 'IP not allowed',
      message: 'Access from this IP address is not permitted.'
    });
  }

  next();
};

/**
 * Request signature validation (Legacy / Placeholder)
 */
export const validateRequestSignature = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

/**
 * Combined Security Middlewares
 * Now includes validateApiKey which handles whitelisted origin bypass
 */
export const securityMiddleware = [
  validateOrigin,
  validateUserAgent,
  validateIP,
  validateApiKey,
  generalRateLimiter,
];

export const enhancedSecurityMiddleware = [
  validateOrigin,
  validateUserAgent,
  validateIP,
  validateApiKey,
  authRateLimiter,
];

export const maximumSecurityMiddleware = [
  validateOrigin,
  validateUserAgent,
  validateIP,
  validateApiKey,
  authRateLimiter,
];