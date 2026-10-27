import { escapeHtml } from '#common/utils';

// Shared shell for transactional emails: inline styles only (email clients ignore <style>),
// rounded 6px corners, borders instead of shadows — same rules as the app UI.

export interface EmailMessage {
  subject: string;
  text: string;
  html: string;
}

export const emailLayout = (body: string, footer: string): string => `
  <div style="background:#fafaf9;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:6px;padding:28px;">
      ${body}
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;" />
      <p style="color:#a8a29e;font-size:12px;line-height:1.5;margin:0;">${footer}</p>
    </div>
  </div>`;

export const emailButton = (href: string, label: string): string => `
  <a href="${escapeHtml(href)}" style="display:inline-block;background:#b91c1c;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 22px;border-radius:6px;">${label}</a>`;
