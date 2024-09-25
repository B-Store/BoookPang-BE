import * as winston from 'winston';

export const winstonConfig = {
  level: 'info', // 로그 레벨
  transports: [
    new winston.transports.File({
      filename: 'http-requests.log', // 로그 파일 이름
      level: 'info', // 로그 레벨
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      )
    }),
    new winston.transports.Console() // 콘솔에도 로그 출력
  ],
};
