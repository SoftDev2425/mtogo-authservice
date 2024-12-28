import express from 'express';
import routes from '../routes';
import cookieParser from 'cookie-parser';
import { logRequestDetails } from '../middlewares/loggerMiddleware';
import { attachCorrelationId } from '../middlewares/attachCorrelationId';

function createServer() {
  const app = express();

  app.use(express.json());

  app.use(cookieParser());

  app.use(attachCorrelationId);

  app.use(logRequestDetails);

  routes(app);

  return app;
}

export default createServer;
