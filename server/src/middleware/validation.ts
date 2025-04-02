import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './error';

export const validate = (schema: Record<string, Joi.Schema>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validationErrors: string[] = [];

    ['params', 'query', 'body'].forEach((key) => {
      if (schema[key]) {
        const validation = schema[key].validate(req[key as keyof Request]);
        if (validation.error) {
          validationErrors.push(validation.error.message);
        }
      }
    });

    if (validationErrors.length > 0) {
      return next(new AppError(`Validation error: ${validationErrors.join(', ')}`, 400));
    }

    next();
  };
};

// Common validation schemas
export const idSchema = Joi.object({
  id: Joi.string().uuid().required()
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

// Job validation schemas
export const jobSchemas = {
  createJob: Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required(),
    amount: Joi.number().required().min(0)
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'active', 'completed', 'cancelled').required()
  }),
  assignDriver: Joi.object({
    driverId: Joi.string().uuid().required()
  })
};

// Payment validation schemas
export const paymentSchemas = {
  processPayment: Joi.object({
    action: Joi.string().valid('approve', 'reject', 'refund').required()
  })
};

// Driver validation schemas
export const driverSchemas = {
  updateStatus: Joi.object({
    status: Joi.string().valid('available', 'busy', 'offline').required()
  }),
  updateLocation: Joi.object({
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180)
  })
}; 