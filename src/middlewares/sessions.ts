import { Response, NextFunction } from 'express';
import { parse } from 'cookie';
import { redisClient } from '../redis/client';
import { CustomRequest } from '@/types/CustomRequest';

export const validateSession = async (
  req: CustomRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const cookies = parse(req.headers.cookie || '');
    const sessionId = cookies.session;

    if (!sessionId) {
      throw new Error('Invalid or expired session');
    }

    const sessionData = await redisClient.get(`sessionToken-${sessionId}`);

    if (!sessionData) {
      throw new Error('Invalid or expired session');
    }

    const parsedSessionData = JSON.parse(sessionData);

    if (!parsedSessionData.email || !parsedSessionData.userId) {
      throw new Error('Invalid session data');
    }

    req.email = parsedSessionData.email;
    req.userId = parsedSessionData.userId;
    req.role = parsedSessionData.role;

    next();
  } catch (error) {
    console.error('Error in session middleware:', error);
    next(error);
  }
};
