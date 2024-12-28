import { Request, Response, NextFunction } from 'express';

const attachCorrelationId = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const correlationId = Array.isArray(req.headers['x-correlation-id'])
    ? req.headers['x-correlation-id'][0]
    : req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId as string;
  next();
};

export { attachCorrelationId };
