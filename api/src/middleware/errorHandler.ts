import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../types';

export const errorHandler = (err: ApiError, _req: Request, res: Response<ApiResponse<unknown>>, _next: NextFunction) => {
  console.error('Unhandled error:', err);

  // Default error response
  const errorResponse: ApiResponse<unknown> = {
    success: false,
    message: err.isOperational ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Set appropriate status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json(errorResponse);
};
