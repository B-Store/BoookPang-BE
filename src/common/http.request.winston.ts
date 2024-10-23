import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const winstonConfig = {
  level: 'info',
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message} - IP: ${info.ip}`,
        ),
      ),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message} - IP: ${info.ip}`,
        ),
      ),
    }),
  ],
};
