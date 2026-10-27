import { describe, expect, it, vi } from 'vitest';
import { Role, UserStatus } from '#common/enums';
import { ErrorCode } from '#common/exceptions';
import { sha256, verifyPassword } from '#common/utils';
import type { AppConfigService } from '#config';
import type { MailService } from '#infra/mail';
import type { UsersService } from '#modules/users';
import type { PasswordResetRepository } from '../repositories/password-reset.repository.js';
import type { RefreshSessionRepository } from '../repositories/refresh-session.repository.js';
import type { AuthService } from './auth.service.js';
import { PasswordResetService } from './password-reset.service.js';

const config = {
  app: { adminAppUrl: 'http://localhost:3001' },
  auth: { passwordReset: { ttlMinutes: 30, cooldownSeconds: 60 } },
} as unknown as AppConfigService;

const owner = { _id: 'user-1', email: 'muthu@example.com', name: 'Muthu', role: Role.VENDOR_OWNER, status: UserStatus.ACTIVE };
const MINUTE = 60_000;

interface SetupOptions {
  user?: unknown;
  reset?: unknown;
  claimed?: boolean;
}

const setup = ({ user = owner, reset = null, claimed = true }: SetupOptions = {}) => {
  const resets = {
    findByUserId: vi.fn().mockResolvedValue(reset),
    findByToken: vi.fn().mockResolvedValue(reset),
    replaceForUser: vi.fn().mockResolvedValue(undefined),
    markUsed: vi.fn().mockResolvedValue(claimed),
  };
  const users = {
    findByEmail: vi.fn().mockResolvedValue(user),
    findById: vi.fn().mockResolvedValue(user),
    updatePassword: vi.fn((_id: string, passwordHash: string) => Promise.resolve({ ...owner, passwordHash })),
  };
  const sessions = { revokeAllForUser: vi.fn().mockResolvedValue(undefined) };
  const auth = { issueSession: vi.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r', user: owner }) };
  const mail = {
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordChangedEmail: vi.fn().mockResolvedValue(undefined),
  };
  const service = new PasswordResetService(
    config,
    resets as unknown as PasswordResetRepository,
    users as unknown as UsersService,
    sessions as unknown as RefreshSessionRepository,
    auth as unknown as AuthService,
    mail as unknown as MailService,
  );
  return { service, resets, users, sessions, auth, mail };
};

const usableReset = (fields: Record<string, unknown> = {}) => ({
  _id: 'reset-1',
  userId: 'user-1',
  expiresAt: new Date(Date.now() + 10 * MINUTE),
  sentAt: new Date(Date.now() - 5 * MINUTE),
  usedAt: null,
  ...fields,
});

const problemOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return 'no error';
  } catch (error) {
    const body = (error as { getResponse: () => { code: string; details: { problem: string } } }).getResponse();
    expect(body.code).toBe(ErrorCode.RESET_LINK_INVALID);
    return body.details.problem;
  }
};

describe('PasswordResetService.requestReset', () => {
  it('stores only the token hash and emails the matching link', async () => {
    const { service, resets, mail } = setup();
    const answer = await service.requestReset(owner.email);

    expect(answer).toEqual({ sent: true, cooldownSeconds: 60 });
    const [userId, fields] = resets.replaceForUser.mock.calls[0] as [string, { tokenHash: string; expiresAt: Date }];
    const { resetUrl } = mail.sendPasswordResetEmail.mock.calls[0][1] as { resetUrl: string };
    const rawToken = new URL(resetUrl).searchParams.get('token')!;

    expect(userId).toBe('user-1');
    expect(rawToken).toMatch(/^[\w-]{43}$/);
    expect(fields.tokenHash).toBe(sha256(rawToken));
    expect(resetUrl).toBe(`http://localhost:3001/reset-password?token=${rawToken}`);
    expect(fields.expiresAt.getTime() - Date.now()).toBeGreaterThan(29 * MINUTE);
  });

  it.each([
    ['an unknown email', null],
    ['a customer', { ...owner, role: Role.CUSTOMER }],
    ['a suspended account', { ...owner, status: UserStatus.SUSPENDED }],
    ['an invited account that is not active yet', { ...owner, status: UserStatus.PENDING_VERIFICATION }],
  ])('gives the same answer and sends nothing for %s', async (_label, user) => {
    const { service, resets, mail } = setup({ user });
    expect(await service.requestReset(owner.email)).toEqual({ sent: true, cooldownSeconds: 60 });
    expect(resets.replaceForUser).not.toHaveBeenCalled();
    expect(mail.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('does not send again inside the cooldown', async () => {
    const { service, mail } = setup({ reset: usableReset({ sentAt: new Date(Date.now() - 10_000) }) });
    await service.requestReset(owner.email);
    expect(mail.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('still answers sent when the email fails', async () => {
    const { service, mail } = setup();
    mail.sendPasswordResetEmail.mockRejectedValue(new Error('SMTP down'));
    await expect(service.requestReset(owner.email)).resolves.toEqual({ sent: true, cooldownSeconds: 60 });
  });
});

describe('PasswordResetService links', () => {
  it.each([
    ['invalid', null],
    ['used', usableReset({ usedAt: new Date() })],
    ['expired', usableReset({ expiresAt: new Date(Date.now() - 1000) })],
  ])('reports %s links', async (problem, reset) => {
    const { service } = setup({ reset });
    expect(await problemOf(service.getDetails('token'))).toBe(problem);
  });

  it('treats a link for an account suspended since as invalid', async () => {
    const { service } = setup({ reset: usableReset(), user: { ...owner, status: UserStatus.SUSPENDED } });
    expect(await problemOf(service.getDetails('token'))).toBe('invalid');
  });

  it('returns the account email for a usable link', async () => {
    const { service } = setup({ reset: usableReset() });
    await expect(service.getDetails('token')).resolves.toMatchObject({ email: owner.email });
  });
});

describe('PasswordResetService.resetPassword', () => {
  it('sets the hashed password, signs out other sessions, notifies and signs in', async () => {
    const { service, users, sessions, auth, mail, resets } = setup({ reset: usableReset() });
    await service.resetPassword({ token: 'token', password: 'NewPass@2026' }, { ipAddress: '1.2.3.4' });

    expect(resets.markUsed).toHaveBeenCalledWith('reset-1');
    const hash = users.updatePassword.mock.calls[0][1];
    expect(hash).not.toContain('NewPass@2026');
    expect(verifyPassword('NewPass@2026', hash)).toBe(true);
    expect(sessions.revokeAllForUser).toHaveBeenCalledWith('user-1');
    expect(mail.sendPasswordChangedEmail).toHaveBeenCalledWith(owner.email, expect.objectContaining({
      forgotPasswordUrl: 'http://localhost:3001/forgot-password',
    }));
    expect(auth.issueSession).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: hash }), { ipAddress: '1.2.3.4' });
  });

  it('refuses a second use of the same link (double submit)', async () => {
    const { service, users } = setup({ reset: usableReset(), claimed: false });
    expect(await problemOf(service.resetPassword({ token: 'token', password: 'NewPass@2026' }))).toBe('used');
    expect(users.updatePassword).not.toHaveBeenCalled();
  });
});
