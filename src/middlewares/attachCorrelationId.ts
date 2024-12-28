import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const attachCorrelationId = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const correlationId = Array.isArray(req.headers['x-correlation-id'])
    ? req.headers['x-correlation-id'][0]
    : req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId as string;
  next();
};

export { attachCorrelationId };
