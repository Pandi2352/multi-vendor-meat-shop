import { Injectable } from '@nestjs/common';
import { ADMIN_APP_PATH } from '#common/constants';
import { InvitationStatus, ROLE_LABELS, type Role } from '#common/enums';
import { randomToken, sha256 } from '#common/utils';
import { AppConfigService } from '#config';
import { MailService } from '#infra/mail';
import type { UserInvitationResponseDto } from '../dto/user-invitation-response.dto.js';
import { toUserInvitationResponseDto } from '../mappers/user-invitation.mapper.js';
import { UserInvitationRepository } from '../repositories/user-invitation.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { UserInvitation } from '../schemas/user-invitation.schema.js';

export interface IssueInvitationInput {
  email: string;
  role: Role;
  invitedBy: string;
  name?: string;
  phone?: string;
  shopId?: string | null;
  /** For the email ("join Muthu Mutton Stall"). The caller knows it; users must not depend on shops. */
  shopName?: string;
  dutyTitle?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The only place invitations are created or re-sent. Each issue makes a fresh 256-bit token,
 * stores only its SHA-256, and emails the set-password link. A failed email never fails the
 * caller's action: the response says `emailSent: false` and carries the one-time link instead.
 */
@Injectable()
export class InvitationsService {
  constructor(
    private readonly config: AppConfigService,
    private readonly invitations: UserInvitationRepository,
    private readonly users: UserRepository,
    private readonly mail: MailService,
  ) {}

  async issue(input: IssueInvitationInput): Promise<UserInvitationResponseDto> {
    const email = input.email.toLowerCase().trim();
    const rawToken = randomToken(32);
    const fields = {
      email,
      role: input.role,
      name: input.name,
      phone: input.phone,
      shopId: input.shopId ?? null,
      dutyTitle: input.dutyTitle ?? null,
      invitedBy: input.invitedBy,
      token: sha256(rawToken),
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + this.config.auth.invitationTtlDays * DAY_MS),
    };

    const existing = await this.invitations.findByEmail(email);
    const invitation = existing
      ? await this.invitations.updateByIdOrThrow(existing._id, { $set: fields })
      : await this.invitations.create({ ...fields, acceptedAt: null, deletedAt: null, deletedBy: null });

    return this.deliver(invitation, rawToken, input.shopName);
  }

  /** New link for an existing invitation (old links stop working). */
  async resend(invitationId: string, invitedBy: string, shopName?: string): Promise<UserInvitationResponseDto> {
    const current = await this.invitations.findByIdOrThrow(invitationId);
    return this.issue({
      email: current.email,
      role: current.role,
      invitedBy,
      name: current.name,
      phone: current.phone,
      shopId: current.shopId,
      dutyTitle: current.dutyTitle,
      shopName,
    });
  }

  private async deliver(
    invitation: UserInvitation,
    rawToken: string,
    shopName?: string,
  ): Promise<UserInvitationResponseDto> {
    const inviteUrl = `${this.config.app.adminAppUrl}${ADMIN_APP_PATH.ACCEPT_INVITE}?token=${rawToken}`;
    const inviter = await this.users.findById(invitation.invitedBy);

    let emailSent = true;
    try {
      await this.mail.sendInvitationEmail(invitation.email, {
        inviteeName: invitation.name,
        roleLabel: ROLE_LABELS[invitation.role],
        shopName,
        inviterName: inviter?.name,
        acceptUrl: inviteUrl,
        expiresAt: invitation.expiresAt,
      });
    } catch {
      emailSent = false; // already logged by MailService
    }

    return { ...toUserInvitationResponseDto(invitation), inviteUrl, emailSent };
  }
}
