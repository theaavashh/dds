import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';
import { CsrfIgnoredMethods } from 'csrf-csrf';

// CSRF protection configuration
const csrfOptions = {
  getSecret: () => process.env.CSRF_SECRET || 'fallback-secret-key-for-development-only-must-be-changed-in-production',

  // Cookie name for the CSRF token
  cookieName: "psifi.x-csrf-token", // Removed __Host- prefix to avoid issues in development

  // Cookie options for the CSRF token
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as boolean | 'lax' | 'strict' | 'none' | undefined,
    path: '/',
    maxAge: 12 * 60 * 60 * 1000 // 12 hours
    // Note: Not setting domain explicitly to avoid issues in development
  },

  // Size of the CSRF token
  size: 64,

  // Whether to ignore the request body when generating tokens
  ignoredMethods: ["GET", "HEAD", "OPTIONS"] as CsrfIgnoredMethods, // These methods don't need CSRF protection

  // Function to get the token from the request
  getCsrfTokenFromRequest: (req: Request) => {
    // Try to get token from header first
    if (req.headers['x-csrf-token']) {
      return req.headers['x-csrf-token'] as string;
    }

    // Then try body
    if (typeof req.body === 'object' && req.body !== null && 'csrfToken' in req.body) {
      return (req.body as { csrfToken: string }).csrfToken;
    }

    // Finally try query parameters
    if (req.query && typeof req.query === 'object' && 'csrfToken' in req.query) {
      return (req.query as { csrfToken: string }).csrfToken as string;
    }

    return undefined;
  }
};

// Create the CSRF protection middleware
const { doubleCsrfProtection, generateToken, validateRequest } = doubleCsrf(csrfOptions);

// Middleware to generate and attach CSRF token to response locals
export const csrfGenerate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Generate a new CSRF token
    const token = generateToken(req, res);

    // Attach token to response locals so it can be accessed in templates/views
    res.locals.csrfToken = token;
    next();
  } catch (error) {
    console.error('CSRF token generation error:', error);
    next();
  }
};

// Middleware to validate CSRF tokens - this is the main protection middleware
export const csrfValidate = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF validation for auth routes, health check, newsletter, and all distributor routes
  if (req.path.startsWith('/api/auth/') ||
    req.path === '/health' ||
    req.path.startsWith('/api/newsletter') ||
    req.path.startsWith('/api/distributors') ||
    req.path.startsWith('/api/inquiries')) {
    return next();
  }

  // Apply CSRF validation for all other routes
  return doubleCsrfProtection(req, res, next);
};

// Export utilities for direct use
export { generateToken, validateRequest };

// Helper function to generate a CSRF token
export const generateCsrfToken = (req: Request, res: Response): string => {
  return generateToken(req, res);
};
