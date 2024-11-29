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

  app.use('/api/auth', AuthRouter);

  app.use('/api/restaurants', RestarantRouter);

  app.get(
    '/api/customer-and-restaurant',
    async (req: Request, res: Response) => {
      try {
        const { customerId, restaurantId } = req.query;

        const data = await handleGetCustomerAndRestaurantData(
          customerId as string,
          restaurantId as string,
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
      logger.error(`Error: ${err.message}`, {
        method,
        url: originalUrl,
        ip,
        stack: err.stack,
      });
      res.status(500).send('Internal Server Error');
    } else {
      logger.error('An unknown error occurred', {
        method,
        url: originalUrl,
        ip,
      });
      res.status(500).send('An unknown error occurred');
    }
  });

  // Catch unregistered routes
  app.all('*', (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });
}

export default routes;
