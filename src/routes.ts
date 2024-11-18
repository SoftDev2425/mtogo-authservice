import { Express, Request, Response } from 'express';
import AuthRouter from './routes/auth.routes';

function routes(app: Express) {
  app.get('/', (_req: Request, res: Response) =>
    res.send(`Hello from MTOGO: Auth Service!`),
  );

  app.get('/healthcheck', (_req: Request, res: Response) =>
    res.sendStatus(200),
  );

  app.use('/api/auth', AuthRouter);

  // Catch unregistered routes
  app.all('*', (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });
}

export default routes;
