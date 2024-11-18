import express from 'express';
import routes from '../routes';
// import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logRequestDetails } from '../middlewares/loggerMiddleware';

function createServer() {
  const app = express();

  app.use(express.json());
  // app.use(
  //   cors({
  //     credentials: true,
  //     origin: ['http://localhost:3000'],
  //   }),
  // );
  app.use(cookieParser());

  app.use(logRequestDetails);

  routes(app);

  return app;
}

export default createServer;
