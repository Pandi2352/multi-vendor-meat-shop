import { Inject, Injectable, type LoggerService } from '@nestjs/common';
import type { Logger } from 'pino';

export const PINO_LOGGER = Symbol('PINO_LOGGER');

/**
 * Nest LoggerService backed by pino. Nest passes the context name as the last string argument,
 * and errors pass the stack before it.
 */
@Injectable()
export class AppLogger implements LoggerService {
  constructor(@Inject(PINO_LOGGER) readonly pino: Logger) {}

  log(message: unknown, ...params: unknown[]): void {
    this.write('info', message, params);
  }

  error(message: unknown, ...params: unknown[]): void {
    const [stack, context] = params.length >= 2 ? params : [params[0], undefined];
    if (message instanceof Error) {
      this.pino.error({ context, err: message }, message.message);
      return;
    }
    this.pino.error({ context, stack }, String(message));
  }

  warn(message: unknown, ...params: unknown[]): void {
    this.write('warn', message, params);
  }

  debug(message: unknown, ...params: unknown[]): void {
    this.write('debug', message, params);
  }

  verbose(message: unknown, ...params: unknown[]): void {
    this.write('trace', message, params);
  }

  fatal(message: unknown, ...params: unknown[]): void {
    this.write('fatal', message, params);
  }

  private write(
    level: 'info' | 'warn' | 'debug' | 'trace' | 'fatal',
    message: unknown,
    params: unknown[],
  ): void {
    const context = typeof params.at(-1) === 'string' ? (params.at(-1) as string) : undefined;
    if (typeof message === 'object' && message !== null) this.pino[level]({ context, ...message });
    else this.pino[level]({ context }, String(message));
  }
}
