import { escapeHtml } from '#common/utils';
import { emailButton, emailLayout, type EmailMessage } from './email-layout.js';

export interface PasswordResetEmailData {
  name?: string;
  resetUrl: string;
  ttlMinutes: number;
  appName: string;
}

/** "Reset your password" email with one button. Every user-supplied value is escaped. */
export const passwordResetEmail = (data: PasswordResetEmailData): EmailMessage => {
  const greeting = data.name ? `Hello ${data.name},` : 'Hello,';

  const text = [
    greeting,
    '',
    `Someone asked to reset the password for your ${data.appName} portal account.`,
    'Choose a new password here:',
    data.resetUrl,
    '',
    `This link works once and expires in ${data.ttlMinutes} minutes.`,
    "If you didn't ask for this, ignore this email — your password stays the same.",
    '',
    data.appName,
  ].join('\n');

  const html = emailLayout(
    `
      <h2 style="color:#1c1917;margin:0 0 12px;font-size:20px;">Reset your password</h2>
      <p style="color:#1c1917;font-size:15px;line-height:1.6;margin:0 0 8px;">${escapeHtml(greeting)}</p>
      <p style="color:#1c1917;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Someone asked to reset the password for your ${escapeHtml(data.appName)} portal account.
      </p>
      <p style="margin:0 0 20px;">${emailButton(data.resetUrl, 'Choose a new password')}</p>
      <p style="color:#57534e;font-size:13px;line-height:1.5;margin:0 0 8px;">
        This link works once and expires in <strong>${data.ttlMinutes} minutes</strong>.
      </p>
      <p style="color:#57534e;font-size:13px;line-height:1.5;margin:0;word-break:break-all;">
        Button not working? Paste this into your browser:<br />${escapeHtml(data.resetUrl)}
      </p>`,
    "If you didn't ask for a password reset, ignore this email — your password stays the same.",
  );

  return { subject: `Reset your ${data.appName} password`, text, html };
};
