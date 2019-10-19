import { createLogger, format, transports } from 'winston';
import { envConfig } from './config';
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

export const logger = createLogger({
  format: combine(
    format.colorize(),
    label({ label: 'FUTBOT' }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console()],
  level: envConfig().FUTBOT_LOG_LEVEL
});
