import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Logger } from 'pino';
import { pinoHttp, type HttpLogger } from 'pino-http';
import { HEADER } from '#common/constants';
import { generateId, isUuid } from '#common/utils';

const QUIET_PATHS = ['/health'];

/** Reuses an incoming X-Request-Id (if it is a UUID) or creates one, and echoes it back. */
const resolveRequestId = (req: IncomingMessage, res: ServerResponse): string => {
  const incoming = req.headers[HEADER.REQUEST_ID];
  const id = typeof incoming === 'string' && isUuid(incoming) ? incoming : generateId();
  res.setHeader(HEADER.REQUEST_ID, id);
  return id;
};

/** Request/response logging + request id. Sets `req.id`, used in error responses. */
export const createHttpLogger = (logger: Logger): HttpLogger =>
  pinoHttp({
    logger,
    genReqId: resolveRequestId,
    autoLogging: { ignore: (req) => QUIET_PATHS.some((path) => req.url?.includes(path)) },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req: (req: { id: string; method: string; url: string }) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
    },
  });
