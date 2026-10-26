import { pino, type Logger } from 'pino';

export interface PinoLoggerOptions {
  name: string;
  level: string;
  pretty: boolean;
}

/** Values never written to logs. Paths follow pino's redact syntax. */
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.passwordHash',
  '*.otp',
  '*.otpHash',
  '*.token',
  '*.refreshToken',
  '*.accessToken',
  '*.secret',
  '*.phone',
];

export const createPinoLogger = ({ name, level, pretty }: PinoLoggerOptions): Logger =>
  pino({
    name,
    level,
    redact: { paths: REDACT_PATHS, censor: '[redacted]' },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: pretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  });
