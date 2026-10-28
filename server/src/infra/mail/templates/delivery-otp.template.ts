import { escapeHtml } from '#common/utils';
import { emailLayout, type EmailMessage } from './email-layout.js';

export interface DeliveryOtpEmailData {
  orderNumber: string;
  otp: string;
  shopName: string;
  totalAmountPaise: number;
  customerName?: string;
  appName: string;
  from: string;
}

export const deliveryOtpEmail = ({
  orderNumber,
  otp,
  shopName,
  totalAmountPaise,
  customerName,
  appName,
  from,
}: DeliveryOtpEmailData): EmailMessage => {
  const formattedAmount = `₹${(totalAmountPaise / 100).toFixed(0)}`;
  const greeting = customerName ? `Hello ${customerName},` : 'Hello,';

  return {
    subject: `[${orderNumber}] Your Delivery Handover OTP: ${otp} — ${appName}`,
    text: `${greeting}\n\nYour order #${orderNumber} from ${shopName} is on its way!\n\nDelivery Handover OTP: ${otp}\nAmount to Pay on Delivery: ${formattedAmount}\n\nPlease share this 4-digit code with your delivery rider only upon receiving and inspecting your fresh meat package.\n\nThank you for ordering with ${appName}!`,
    html: emailLayout(
      `
        <h2 style="color:#b91c1c;margin:0 0 12px;">Delivery Handover OTP</h2>
        <p style="color:#1c1917;font-size:15px;line-height:1.5;">${greeting}</p>
        <p style="color:#1c1917;font-size:15px;line-height:1.5;">
          Your fresh meat order <strong>#${escapeHtml(orderNumber)}</strong> from <strong>${escapeHtml(shopName)}</strong> is being prepared for delivery.
        </p>
        <div style="margin:24px 0;text-align:center;">
          <div style="font-size:13px;color:#78716c;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Share with delivery partner:</div>
          <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:8px;padding:14px 28px;background:#fef2f2;border:2px solid #b91c1c;border-radius:6px;color:#b91c1c;">${escapeHtml(otp)}</span>
        </div>
        <div style="background:#f5f5f4;border:1px solid #e7e5e4;border-radius:6px;padding:12px 16px;margin:16px 0;">
          <p style="margin:0;font-size:14px;color:#1c1917;"><strong>Cash on Delivery:</strong> ${escapeHtml(formattedAmount)}</p>
        </div>
        <p style="color:#57534e;font-size:13px;line-height:1.5;">
          <strong>Security note:</strong> For your safety, only share this 4-digit code with the delivery partner after you receive your parcel.
        </p>`,
      `Sent by ${escapeHtml(from)} • ${escapeHtml(appName)}`,
    ),
  };
};
