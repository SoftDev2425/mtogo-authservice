// utils/logger.ts
import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';

// Helper function to create directories
const ensureLogDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Generate log file path based on the current month and day
const getLogFilePath = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const logDir = path.resolve('./logs'); // Root `logs` directory
  const monthlyFolder = path.join(logDir, `${year}-${month}`); // e.g., "logs/2024-12"

  // Ensure the log directory exists
  ensureLogDirectoryExists(monthlyFolder);

  return path.join(monthlyFolder, `${day}.log`); // e.g., "logs/2024-12/28.log"
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Include stack traces for errors
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length
        ? `\n${JSON.stringify(meta, null, 2)}`
        : '';
      return `${timestamp} \n[${level.toUpperCase()}]: ${message}${metaString}\n`;
    }),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : '';
          return `${timestamp} \n[${level.toUpperCase()}]: ${message}${metaString}\n`;
        }),
      ),
    }),
    new transports.File({ filename: getLogFilePath(), level: 'info' }),
  ],
});
export { logger };
