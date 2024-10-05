import * as winston from 'winston';

export const winstonConfig = {
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: 'http-requests.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      )
    }),
    new winston.transports.Console()
  ],
};
