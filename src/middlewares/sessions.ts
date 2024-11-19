import { Response, NextFunction } from 'express';
import { redisClient } from '../redis/client';
import { CustomRequest } from '@/types/CustomRequest';

export const validateSession = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Invalid or expired session' });
    }

    const sessionData = await redisClient.get(`sessionToken-${sessionId}`);

    if (!sessionData) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const parsedSessionData = JSON.parse(sessionData);

    if (!parsedSessionData.email || !parsedSessionData.userId) {
      return res.status(400).json({ message: 'Invalid session data' });
    }

    req.email = parsedSessionData.email;
    req.userId = parsedSessionData.userId;
    req.role = parsedSessionData.role;

    res.status(200).json({
      message: 'Session is valid',
      email: req.email,
      userId: req.userId,
      role: req.role,
    });
  } catch (error: unknown) {
    console.error('Error in session middleware:', error);

    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('An error occurred'));
    }
  }
};
