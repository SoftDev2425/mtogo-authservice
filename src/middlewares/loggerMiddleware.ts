// middleware/loggerMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const logRequestDetails = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const correlationId = req.correlationId;

  logger.info(`Incoming Request`, {
    correlationId,
    method,
    url: originalUrl,
    ip,
    userAgent,
    query: req.query,
    params: req.params,
  });

  next();
};

export { logRequestDetails };
