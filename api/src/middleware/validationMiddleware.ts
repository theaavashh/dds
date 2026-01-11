import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Merge body, params, and query for comprehensive validation
      const requestData = {
        ...req.body,
        ...req.params,
        ...req.query
      };

      if (requestData.subcategories && typeof requestData.subcategories === 'string') {
        try {
          requestData.subcategories = JSON.parse(requestData.subcategories);
        } catch {}
      }

      // Convert string booleans to actual booleans
      if (typeof requestData.isActive === 'string') {
        requestData.isActive = requestData.isActive.toLowerCase() === 'true';
      }

      // Parse and validate the request data
      const result = schema.safeParse(requestData);
      
      if (!result.success) {
        // Log validation errors for debugging
        console.error('Validation failed:', JSON.stringify(result.error.issues, null, 2));
        
        // If validation fails, send a 400 Bad Request response with detailed errors
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.error.issues
        });
      }
      
      // If validation passes, continue to the next middleware
      next();
    } catch (error: any) {
      // Log unexpected errors
      console.error('Unexpected error in validation middleware:', error);
      
      // Send a 500 Internal Server Error response
      return res.status(500).json({
        success: false,
        message: 'Internal server error during validation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};
