import { escapeHtml, formatIST } from '#common/utils';
import { emailButton, emailLayout, type EmailMessage } from './email-layout.js';

export interface PasswordChangedEmailData {
  name?: string;
  changedAt: Date;
  /** Where to start a new reset if the change wasn't the account holder. */
  forgotPasswordUrl: string;
  appName: string;
}

/** Security notice sent after a password reset. Every user-supplied value is escaped. */
export const passwordChangedEmail = (data: PasswordChangedEmailData): EmailMessage => {
  const greeting = data.name ? `Hello ${data.name},` : 'Hello,';
  const when = formatIST(data.changedAt, 'DD MMM YYYY, hh:mm A');

  const text = [
    greeting,
    '',
    `The password for your ${data.appName} portal account was changed on ${when} (IST).`,
    'All other devices were signed out.',
    '',
    "If this wasn't you, reset your password now and tell the operations team:",
    data.forgotPasswordUrl,
    '',
    data.appName,
  ].join('\n');

  const html = emailLayout(
    `
      <h2 style="color:#1c1917;margin:0 0 12px;font-size:20px;">Your password was changed</h2>
      <p style="color:#1c1917;font-size:15px;line-height:1.6;margin:0 0 8px;">${escapeHtml(greeting)}</p>
      <p style="color:#1c1917;font-size:15px;line-height:1.6;margin:0 0 20px;">
        The password for your ${escapeHtml(data.appName)} portal account was changed on
        <strong>${escapeHtml(when)} (IST)</strong>. All other devices were signed out.
      </p>
      <p style="color:#1c1917;font-size:15px;line-height:1.6;margin:0 0 20px;">
        If this wasn’t you, reset your password now and tell the operations team.
      </p>
      <p style="margin:0;">${emailButton(data.forgotPasswordUrl, 'Reset my password')}</p>`,
    'You’re getting this because the password on your account changed.',
  );

  return { subject: `Your ${data.appName} password was changed`, text, html };
};
