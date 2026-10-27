import { escapeHtml, formatIST } from '#common/utils';
import { emailButton, emailLayout, type EmailMessage } from './email-layout.js';

export interface InvitationEmailData {
  inviteeName?: string;
  /** Human role, e.g. "Shop owner". */
  roleLabel: string;
  /** Set for shop owners and staff. */
  shopName?: string;
  inviterName?: string;
  acceptUrl: string;
  expiresAt: Date;
  appName: string;
}

/** "You're invited" email with a single set-password button. Every user-supplied value is escaped. */
export const invitationEmail = (data: InvitationEmailData): EmailMessage => {
  const greeting = data.inviteeName ? `Hello ${data.inviteeName},` : 'Hello,';
  const place = data.shopName ? `${data.shopName} on ${data.appName}` : data.appName;
  const by = data.inviterName ? `${data.inviterName} has invited you` : 'You have been invited';
  const expires = formatIST(data.expiresAt, 'DD MMM YYYY, hh:mm A');

  const text = [
    greeting,
    '',
    `${by} to join ${place} as ${data.roleLabel}.`,
    '',
    'Set your password to activate your account:',
    data.acceptUrl,
    '',
    `This link expires on ${expires} (IST) and works once.`,
    "If you weren't expecting this, you can ignore this email — no account is activated until you set a password.",
    '',
    data.appName,
  ].join('\n');

  const html = emailLayout(
    `
      <h2 style="color:#1c1917;margin:0 0 12px;font-size:20px;">You’re invited to ${escapeHtml(place)}</h2>
      <p style="color:#1c1917;font-size:15px;line-height:1.6;margin:0 0 8px;">${escapeHtml(greeting)}</p>
      <p style="color:#1c1917;font-size:15px;line-height:1.6;margin:0 0 20px;">
        ${escapeHtml(by)} to join as <strong>${escapeHtml(data.roleLabel)}</strong>.
        Set a password to activate your account and open the portal.
      </p>
      <p style="margin:0 0 20px;">${emailButton(data.acceptUrl, 'Set your password')}</p>
      <p style="color:#57534e;font-size:13px;line-height:1.5;margin:0 0 8px;">
        This link expires on <strong>${escapeHtml(expires)} (IST)</strong> and can be used once.
      </p>
      <p style="color:#57534e;font-size:13px;line-height:1.5;margin:0;word-break:break-all;">
        Button not working? Paste this into your browser:<br />${escapeHtml(data.acceptUrl)}
      </p>`,
    "If you weren't expecting this invitation, ignore this email — no account is activated until a password is set.",
  );

  return { subject: `You're invited to ${place}`, text, html };
};
