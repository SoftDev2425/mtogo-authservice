import express from 'express';
import routes from '../routes';
import cookieParser from 'cookie-parser';
import { logRequestDetails } from '../middlewares/loggerMiddleware';
import { attachCorrelationId } from '../middlewares/attachCorrelationId';
import { register, Counter, Histogram } from 'prom-client';

function createServer() {
  const app = express();

  app.get('/favicon.ico', (_req, res) => res.status(204));

  // Register Prometheus metrics
  const requestCount = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  const requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 3, 5],
  });

  // middleware to track request metrics
  app.use((req, res, next) => {
    const end = requestDuration.startTimer();
    const route = req.originalUrl || req.url;

    res.on('finish', () => {
      requestCount.inc({
        method: req.method,
        route,
        status_code: res.statusCode,
      });
      end({ method: req.method, route, status_code: res.statusCode });
    });
    next();
  });

  // metrics endpoint
  app.get('/metrics', async (_req, res) => {
    try {
      const metrics = await register.metrics(); // Wait for the metrics
      res.set('Content-Type', register.contentType);
      res.end(metrics); // Send the resolved string to the response
    } catch {
      res.status(500).send('Error fetching metrics');
    }
  });

  app.use(express.json());

  app.use(cookieParser());

  app.use(attachCorrelationId);

  app.use(logRequestDetails);

  routes(app);

  return app;
}

export default createServer;
