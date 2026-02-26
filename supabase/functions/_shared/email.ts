/**
 * Shared email utilities for edge functions that send email via Resend.
 *
 * Usage:
 *   import { getValidatedFromEmail, getEmailTemplate } from '../_shared/email.ts';
 */

const DEFAULT_FROM = 'Elevate <hello@mail.sayelevate.com>';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate and normalise the FROM_EMAIL env var.
 * Returns a safe "Name <email>" string or the default sender.
 */
export function getValidatedFromEmail(): string {
  const raw = Deno.env.get('FROM_EMAIL')?.trim();

  if (!raw) return DEFAULT_FROM;

  // Already in "Name <email>" format
  if (raw.includes('<') && raw.includes('>')) {
    const match = raw.match(/<([^>]+)>/);
    if (match && EMAIL_REGEX.test(match[1])) return raw;
    return DEFAULT_FROM;
  }

  // Plain email address
  if (EMAIL_REGEX.test(raw)) return `Elevate <${raw}>`;

  return DEFAULT_FROM;
}

/**
 * Standard dark-theme HTML email template matching the existing OTP email style.
 */
export function getEmailTemplate(
  title: string,
  content: string,
  unsubscribeUrl?: string,
): string {
  const year = new Date().getFullYear();
  const htmlContent = content.replace(/\n/g, '<br>');
  const unsubBlock = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color: #9ca3af !important; text-decoration: underline;">Update email preferences</a><br><br>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 20px 16px !important; }
      .content-box { padding: 40px 24px !important; }
      h1 { font-size: 24px !important; margin-bottom: 30px !important; }
      .text { font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000 !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000000;">
    <tr><td style="padding:20px;">
  <![endif]-->
  <div class="container" style="max-width:600px;margin:0 auto;padding:40px 20px;background-color:#000000;">
    <div class="content-box" style="background-color:#000000;border-radius:8px;padding:60px 40px;box-shadow:0 1px 3px 0 rgba(255,255,255,0.1);">
      <h1 style="font-size:32px;font-weight:600;margin:0 0 40px 0;text-align:center;color:#ffffff !important;line-height:1.2;">${title}</h1>
      <div style="text-align:left;margin-bottom:40px;">
        <div class="text" style="font-size:18px;color:#ffffff !important;line-height:1.6;margin:0 0 16px 0;white-space:pre-wrap;">${htmlContent}</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:30px;padding:0 20px;">
      <p style="font-size:14px;color:#9ca3af !important;line-height:1.5;margin:0 0 16px 0;">${unsubBlock}If you have any questions, please contact us at hello@sayelevate.com</p>
      <p style="font-size:12px;color:#6b7280 !important;line-height:1.5;margin:0;">&copy; ${year} Elevate. All rights reserved.</p>
    </div>
  </div>
  <!--[if mso]>
    </td></tr>
  </table>
  <![endif]-->
</body>
</html>`;
}
