import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`;
});

export function getLogger(l: string) {
  return createLogger({
    format: combine(
      format.colorize(),
      label({ label: l }),
      timestamp(),
      myFormat
    ),
    transports: [new transports.Console()],
    level: process.env.FUTBOT_LOG_LEVEL || 'info'
  });
}
