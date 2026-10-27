import { escapeHtml } from '#common/utils';
import { emailLayout, type EmailMessage } from './email-layout.js';

export interface OtpEmailData {
  otp: string;
  ttlMinutes: number;
  appName: string;
  from: string;
}

export const otpEmail = ({ otp, ttlMinutes, appName, from }: OtpEmailData): EmailMessage => ({
  subject: `Your verification code: ${otp}`,
  text: `Hello,\n\nYour one-time verification code is: ${otp}\n\nThis code expires in ${ttlMinutes} minutes.\nIf you did not request this code, you can ignore this email.\n\n${appName}`,
  html: emailLayout(
    `
      <h2 style="color:#b91c1c;margin:0 0 12px;">Verification code</h2>
      <p style="color:#1c1917;font-size:15px;line-height:1.5;">Use this one-time code to sign in:</p>
      <div style="margin:24px 0;text-align:center;">
        <span style="display:inline-block;font-size:28px;font-weight:bold;letter-spacing:6px;padding:12px 24px;background:#f5f5f4;border:1px solid #e7e5e4;border-radius:6px;color:#1c1917;">${escapeHtml(otp)}</span>
      </div>
      <p style="color:#57534e;font-size:13px;line-height:1.5;">It expires in <strong>${ttlMinutes} minutes</strong>. Never share this code with anyone.</p>`,
    `Sent by ${escapeHtml(from)}`,
  ),
});
