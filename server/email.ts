import { Resend } from "resend";
import { ENV } from "./_core/env";

// ─── Configuration ───────────────────────────────────────────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "SANI <onboarding@resend.dev>";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured. Please set it in environment variables.");
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

// ─── Email Templates ─────────────────────────────────────────────────────────

interface InvitationEmailData {
  recipientEmail: string;
  recipientName?: string;
  companyName: string;
  companyLogo?: string | null;
  inviterName: string;
  role: string;
  inviteLink: string;
  expiresAt: Date;
}

function buildInvitationEmailHtml(data: InvitationEmailData): string {
  const expiryDate = new Date(data.expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const logoSection = data.companyLogo
    ? `<img src="${data.companyLogo}" alt="${data.companyName}" style="height:48px;max-width:200px;margin-bottom:16px;" />`
    : `<div style="font-size:28px;font-weight:700;color:#0d9488;margin-bottom:16px;">${data.companyName}</div>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're Invited to Join ${data.companyName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:40px 40px 32px;text-align:center;">
              <div style="margin-bottom:12px;">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)"/>
                  <path d="M12 20L18 26L28 14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">You're Invited!</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Join your team on SANI</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <!-- Company Logo/Name -->
              <div style="text-align:center;margin-bottom:32px;">
                ${logoSection}
              </div>

              <!-- Greeting -->
              <p style="color:#18181b;font-size:16px;line-height:1.6;margin:0 0 20px;">
                Hi${data.recipientName ? ` <strong>${data.recipientName}</strong>` : ""},
              </p>

              <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 20px;">
                <strong>${data.inviterName}</strong> has invited you to join <strong>${data.companyName}</strong> on SANI as a <strong style="color:#0d9488;">${data.role}</strong>.
              </p>

              <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 32px;">
                SANI is the Employee OS that powers HR, payroll, and team management. Click the button below to accept your invitation and set up your account.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:0 0 32px;">
                <a href="${data.inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;box-shadow:0 4px 14px rgba(13,148,136,0.4);">
                  Accept Invitation
                </a>
              </div>

              <!-- Info Box -->
              <div style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-radius:10px;padding:20px;margin:0 0 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#71717a;font-size:13px;padding:4px 0;">Company</td>
                    <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${data.companyName}</td>
                  </tr>
                  <tr>
                    <td style="color:#71717a;font-size:13px;padding:4px 0;">Role</td>
                    <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${data.role}</td>
                  </tr>
                  <tr>
                    <td style="color:#71717a;font-size:13px;padding:4px 0;">Invited by</td>
                    <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${data.inviterName}</td>
                  </tr>
                  <tr>
                    <td style="color:#71717a;font-size:13px;padding:4px 0;">Expires</td>
                    <td style="color:#18181b;font-size:13px;font-weight:600;text-align:right;padding:4px 0;">${expiryDate}</td>
                  </tr>
                </table>
              </div>

              <!-- Fallback Link -->
              <p style="color:#a1a1aa;font-size:12px;line-height:1.6;margin:0 0 8px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color:#0d9488;font-size:12px;word-break:break-all;margin:0 0 24px;">
                <a href="${data.inviteLink}" style="color:#0d9488;text-decoration:underline;">${data.inviteLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:24px 40px;border-top:1px solid #f4f4f5;">
              <p style="color:#a1a1aa;font-size:12px;text-align:center;margin:0 0 8px;">
                This invitation was sent by ${data.companyName} via SANI.
              </p>
              <p style="color:#d4d4d8;font-size:11px;text-align:center;margin:0;">
                SANI — The Employee OS Built for Modern Teams
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildInvitationEmailText(data: InvitationEmailData): string {
  return `
You're Invited to Join ${data.companyName}!

Hi${data.recipientName ? ` ${data.recipientName}` : ""},

${data.inviterName} has invited you to join ${data.companyName} on SANI as a ${data.role}.

Accept your invitation here: ${data.inviteLink}

Details:
- Company: ${data.companyName}
- Role: ${data.role}
- Invited by: ${data.inviterName}
- Expires: ${new Date(data.expiresAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

SANI — The Employee OS Built for Modern Teams
  `.trim();
}

// ─── Send Functions ──────────────────────────────────────────────────────────

export interface SendInvitationEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendInvitationEmail(
  data: InvitationEmailData
): Promise<SendInvitationEmailResult> {
  try {
    const resend = getResendClient();

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.recipientEmail,
      subject: `You're invited to join ${data.companyName} on SANI`,
      html: buildInvitationEmailHtml(data),
      text: buildInvitationEmailText(data),
    });

    if (error) {
      console.error("[Email] Failed to send invitation email:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Invitation email sent to ${data.recipientEmail}, messageId: ${result?.id}`);
    return { success: true, messageId: result?.id };
  } catch (err: any) {
    console.error("[Email] Error sending invitation email:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

// ─── Batch Send ──────────────────────────────────────────────────────────────

export async function sendBatchInvitationEmails(
  invitations: InvitationEmailData[]
): Promise<SendInvitationEmailResult[]> {
  const results = await Promise.allSettled(
    invitations.map((inv) => sendInvitationEmail(inv))
  );

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { success: false, error: r.reason?.message || "Unknown error" }
  );
}

// ─── Welcome Email ───────────────────────────────────────────────────────────

interface WelcomeEmailData {
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  dashboardLink: string;
}

export async function sendWelcomeEmail(
  data: WelcomeEmailData
): Promise<SendInvitationEmailResult> {
  try {
    const resend = getResendClient();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          <tr>
            <td style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">Welcome to ${data.companyName}!</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Your account is ready</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#18181b;font-size:16px;line-height:1.6;margin:0 0 20px;">Hi <strong>${data.recipientName}</strong>,</p>
              <p style="color:#3f3f46;font-size:15px;line-height:1.7;margin:0 0 32px;">Welcome aboard! Your account at <strong>${data.companyName}</strong> has been set up on SANI. You can now access your employee dashboard to view your profile, payroll, and team information.</p>
              <div style="text-align:center;margin:0 0 32px;">
                <a href="${data.dashboardLink}" style="display:inline-block;background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 40px;border-radius:10px;box-shadow:0 4px 14px rgba(13,148,136,0.4);">Go to Dashboard</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#fafafa;padding:24px 40px;border-top:1px solid #f4f4f5;">
              <p style="color:#d4d4d8;font-size:11px;text-align:center;margin:0;">SANI — The Employee OS Built for Modern Teams</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.recipientEmail,
      subject: `Welcome to ${data.companyName} on SANI!`,
      html,
      text: `Welcome to ${data.companyName}! Hi ${data.recipientName}, your account is ready. Go to your dashboard: ${data.dashboardLink}`,
    });

    if (error) {
      console.error("[Email] Failed to send welcome email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (err: any) {
    console.error("[Email] Error sending welcome email:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}


const MONTHS_NAME = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export async function sendPayslipEmail({
  recipientEmail,
  employeeName,
  companyName,
  month,
  year,
  netPay,
  currency,
  pdfUrl,
  pdfBuffer,
  pdfFileName,
}: {
  recipientEmail: string;
  employeeName: string;
  companyName: string;
  month: number;
  year: number;
  netPay: string;
  currency: string;
  pdfBuffer?: Buffer;
  pdfFileName?: string;
  pdfUrl?: string;
}) {
  try {
    const resend = getResendClient();
    const attachments = pdfBuffer
      ? [{ filename: pdfFileName || `Payslip-${month}-${year}.pdf`, content: pdfBuffer, contentType: "application/pdf" }]
      : undefined;
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Your payslip for ${MONTHS_NAME[month - 1]} ${year} is ready — ${companyName}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px">
          <div style="background:linear-gradient(135deg,#0D9488,#0891B2);border-radius:12px;padding:28px;color:white;text-align:center;margin-bottom:20px">
            <h1 style="margin:0 0 6px;font-size:20px">Payslip Ready</h1>
            <p style="margin:0;opacity:0.9;font-size:13px">${MONTHS_NAME[month - 1]} ${year}</p>
          </div>
          <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:20px">
            <p style="color:#334155;font-size:14px;margin:0 0 12px">Hi ${employeeName.split(" ")[0]},</p>
            <p style="color:#334155;font-size:14px;margin:0 0 12px">Your payslip for <strong>${MONTHS_NAME[month - 1]} ${year}</strong> has been processed by <strong>${companyName}</strong>.</p>
            <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center;margin:16px 0">
              <p style="color:#64748b;font-size:12px;margin:0 0 4px">Net Pay</p>
              <p style="color:#0D9488;font-size:24px;font-weight:bold;margin:0">${currency} ${Number(netPay).toLocaleString()}</p>
            </div>
            <p style="color:#64748b;font-size:13px;margin:0">Log in to your SANI account to view the full breakdown and download the PDF.</p>
            ${pdfUrl ? `<p style="color:#64748b;font-size:13px;margin:12px 0 0;">If you prefer, download your payslip directly: <a href="${pdfUrl}" style="color:#0D9488;">Download PDF</a></p>` : ""}
          </div>
          <div style="text-align:center">
            <a href="http://localhost:3000/employee/payslips" style="display:inline-block;background:#0D9488;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:13px">View Payslip →</a>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:24px">${companyName} · Powered by SANI</p>
        </div>
      `,
      attachments,
    });
    if (error) {
      console.error("[Email] Payslip email failed:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Payslip email sent to ${recipientEmail} (${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Email] Payslip email failed:", err?.message || err);
    return { success: false, error: err?.message };
  }
}
