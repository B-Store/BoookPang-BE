import _ from 'lodash';
import { createLogger, format, transports } from 'winston';
import { SPLAT } from 'triple-beam';
import DailyRotateFile from 'winston-daily-rotate-file'; // 이 부분 확인

const localFormat = format.printf(({ level, message, timestamp, label, ...meta }) => {
  let logMessage = `${timestamp} [${label}] ${level}: ${message}`;
  const args = meta[SPLAT];
  if (args) {
    Object.values(args).forEach((arg: any) => {
      if (_.isObject(arg)) {
        logMessage += ` ${JSON.stringify(arg)}`;
      } else {
        logMessage += ` ${arg}`;
      }
    });
  }
  return logMessage;
});

const lokiFormat = format.printf(({ level, message, label, ...meta }) => {
  let logMessage = `[${label}] level=${level}: ${message}`;
  const args = meta[SPLAT];
  if (args) {
    Object.values(args).forEach((arg: any) => {
      if (_.isObject(arg)) {
        logMessage += ` ${JSON.stringify(arg)}`;
      } else {
        logMessage += ` ${arg}`;
      }
    });
  }
  return logMessage;
});

function getLogger(serviceType: string) {
  const options = {
    transports: [
      new DailyRotateFile({
        format: format.combine(
          format.label({ label: serviceType }),
          lokiFormat,
        ),
        filename: `logs/${serviceType}_%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '7d',
      }),
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.label({ label: serviceType }),
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          localFormat,
        ),
      }),
    ],
  };

  return createLogger(options);
}

export default getLogger;
