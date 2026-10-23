import type { ClientSession, Connection } from 'mongoose';
import { AppException, ErrorCode } from '#common/exceptions';

const isStandaloneError = (error: unknown): boolean =>
  error instanceof Error &&
  ((error as { code?: number }).code === 20 ||
    /Transaction numbers are only allowed/.test(error.message));

/**
 * Runs `work` inside a MongoDB transaction (with the driver's automatic retry on transient errors).
 * Pass the session to every repository call inside `work`.
 * Requires a replica set — on a standalone server it fails with TRANSACTION_NOT_SUPPORTED instead of
 * silently writing without a transaction.
 */
export const runInTransaction = async <T>(
  connection: Connection,
  work: (session: ClientSession) => Promise<T>,
): Promise<T> => {
  try {
    return await connection.transaction(work);
  } catch (error) {
    if (isStandaloneError(error))
      throw new AppException(ErrorCode.TRANSACTION_NOT_SUPPORTED, { cause: error });
    throw error;
  }
};
