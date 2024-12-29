import { Express, NextFunction, Request, Response } from 'express';
import AuthRouter from './routes/auth.routes';
import RestarantRouter from './routes/restaurants.routes';
import { logger } from './utils/logger';
import { handleGetCustomerAndRestaurantData } from './controllers/customerAndRestaurant.controller';

function routes(app: Express) {
  app.get('/', (_req: Request, res: Response) =>
    res.send(`Hello from MTOGO: Auth Service!`),
  );

  app.get('/healthcheck', (_req: Request, res: Response) =>
    res.sendStatus(200),
  );

  app.get('/cpu-intensive', (_req, res) => {
    const now = Date.now();
    // eslint-disable-next-line no-empty
    while (Date.now() - now < 5000) {} // Simulates 5 seconds of CPU load
    res.send('CPU-intensive task completed');
  });

  app.use('/api/auth', AuthRouter);

  app.use('/api/restaurants', RestarantRouter);

  app.get(
    '/api/customer-and-restaurant',
    async (req: Request, res: Response) => {
      try {
        const { customerId, restaurantId } = req.query;

        // Ensure customer id is correct format
        if (!customerId || typeof customerId !== 'string') {
          return res
            .status(400)
            .json({ error: 'Invalid or missing customerId' });
        }
        // Ensure restaurant id is correct format
        if (!restaurantId || typeof restaurantId !== 'string') {
          return res
            .status(400)
            .json({ error: 'Invalid or missing restaurantId' });
        }

        const data = await handleGetCustomerAndRestaurantData(
          customerId,
          restaurantId,
        );

        res.status(200).json(data);
      } catch (error) {
        if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        }

        res.status(500).json({
          error: 'An unknown error occurred in customer-and-restaurant route',
        });
      }
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const { method, originalUrl, ip } = req;

    if (err instanceof Error) {
      // Ensures sensitive details are not exposed in production
      const sanitizedMessage =
        process.env.NODE_ENV === 'production'
          ? 'An internal error occurred'
          : err.message;

      logger.error(`Error: ${sanitizedMessage}`, {
        method,
        url: originalUrl,
        ip,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      });

      res.status(500).send('Internal Server Error');
    }
  });

  // Catch-all for unregistered routes, creates an error for the requested route and passes it to the error handler.
  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    next(new Error(`Route ${req.originalUrl} not found`));
  });
}

export default routes;
