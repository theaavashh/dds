import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error: ApiError = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
