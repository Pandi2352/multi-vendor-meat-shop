import { describe, expect, it, vi } from 'vitest';
import { InvitationStatus, Role } from '#common/enums';
import { sha256 } from '#common/utils';
import type { AppConfigService } from '#config';
import type { MailService } from '#infra/mail';
import type { UserInvitationRepository } from '../repositories/user-invitation.repository.js';
import type { UserRepository } from '../repositories/user.repository.js';
import { InvitationsService } from './invitations.service.js';

const config = {
  app: { adminAppUrl: 'http://localhost:3001' },
  auth: { invitationTtlDays: 7 },
} as unknown as AppConfigService;

const stored = (fields: Record<string, unknown>) => ({
  _id: 'inv-1',
  createdAt: new Date('2026-10-27T00:00:00Z'),
  acceptedAt: null,
  ...fields,
});

const setup = ({ existing, mailFails = false }: { existing?: unknown; mailFails?: boolean } = {}) => {
  const invitations = {
    findByEmail: vi.fn().mockResolvedValue(existing ?? null),
    findByIdOrThrow: vi.fn(),
    create: vi.fn((fields: Record<string, unknown>) => Promise.resolve(stored(fields))),
    updateByIdOrThrow: vi.fn((_id: string, update: { $set: Record<string, unknown> }) => Promise.resolve(stored(update.$set))),
  };
  const users = { findById: vi.fn().mockResolvedValue({ name: 'Super Admin' }) };
  const mail = {
    sendInvitationEmail: mailFails ? vi.fn().mockRejectedValue(new Error('SMTP down')) : vi.fn().mockResolvedValue(undefined),
  };
  const service = new InvitationsService(
    config,
    invitations as unknown as UserInvitationRepository,
    users as unknown as UserRepository,
    mail as unknown as MailService,
  );
  return { service, invitations, mail };
};

const input = { email: ' Muthu@Example.COM ', role: Role.VENDOR_OWNER, invitedBy: 'admin-1', name: 'Muthu', shopId: 'shop-1', shopName: 'Muthu Mutton' };

describe('InvitationsService', () => {
  it('stores only the token hash and emails the matching one-time link', async () => {
    const { service, invitations, mail } = setup();
    const result = await service.issue(input);

    const saved = invitations.create.mock.calls[0][0] as { token: string; email: string; status: string };
    const rawToken = new URL(result.inviteUrl!).searchParams.get('token')!;

    expect(rawToken).toMatch(/^[\w-]{43}$/); // 256 bits, base64url
    expect(saved.token).toBe(sha256(rawToken));
    expect(saved.token).not.toBe(rawToken);
    expect(saved.email).toBe('muthu@example.com');
    expect(saved.status).toBe(InvitationStatus.PENDING);
    expect(result.inviteUrl).toBe(`http://localhost:3001/accept-invite?token=${rawToken}`);
    expect(result).not.toHaveProperty('token');
    expect(mail.sendInvitationEmail).toHaveBeenCalledWith(
      'muthu@example.com',
      expect.objectContaining({ acceptUrl: result.inviteUrl, roleLabel: 'Shop owner', shopName: 'Muthu Mutton', inviterName: 'Super Admin' }),
    );
    expect(result.emailSent).toBe(true);
  });

  it('expires after the configured number of days', async () => {
    const { service, invitations } = setup();
    const before = Date.now();
    await service.issue(input);
    const { expiresAt } = invitations.create.mock.calls[0][0] as { expiresAt: Date };
    expect(expiresAt.getTime() - before).toBeGreaterThanOrEqual(7 * 24 * 3600 * 1000 - 1000);
    expect(expiresAt.getTime() - before).toBeLessThanOrEqual(7 * 24 * 3600 * 1000 + 1000);
  });

  it('re-issuing replaces the token on the existing invitation (old link stops working)', async () => {
    const { service, invitations } = setup({ existing: stored({ email: 'muthu@example.com', token: 'old-hash' }) });
    await service.issue(input);
    expect(invitations.create).not.toHaveBeenCalled();
    const update = invitations.updateByIdOrThrow.mock.calls[0][1] as { $set: { token: string; status: string } };
    expect(update.$set.token).not.toBe('old-hash');
    expect(update.$set.status).toBe(InvitationStatus.PENDING);
  });

  it('a failed email does not fail the caller; the one-time link is still returned', async () => {
    const { service } = setup({ mailFails: true });
    const result = await service.issue(input);
    expect(result.emailSent).toBe(false);
    expect(result.inviteUrl).toContain('/accept-invite?token=');
  });

  it('every issue uses a different token', async () => {
    const { service } = setup();
    const a = await service.issue(input);
    const b = await service.issue(input);
    expect(a.inviteUrl).not.toBe(b.inviteUrl);
  });
});
