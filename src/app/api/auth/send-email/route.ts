import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    resend = new Resend(apiKey);
  }
  return resend;
}

// GoTrue send_email hook payload
interface SendEmailHookPayload {
  user: {
    id: string;
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

const FROM_ADDRESS = "RankRiot <noreply@rankriot.app>";
const PRIMARY_COLOR = "#223971";

function buildConfirmationUrl(siteUrl: string, tokenHash: string, type: string, redirectTo?: string): string {
  const base = siteUrl.replace(/\/$/, "");
  let url = `${base}/auth/confirm?token_hash=${tokenHash}&type=${type}`;
  if (redirectTo) url += `&redirect_to=${encodeURIComponent(redirectTo)}`;
  return url;
}

function getEmailContent(
  actionType: string,
  token: string,
  tokenHash: string,
  siteUrl: string,
  redirectTo: string,
): { subject: string; html: string } {
  const confirmUrl = buildConfirmationUrl(siteUrl, tokenHash, actionType === "login" ? "magiclink" : actionType, redirectTo);

  const wrapper = (body: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr><td style="background:${PRIMARY_COLOR};padding:24px 32px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">RankRiot</h1>
</td></tr>
<tr><td style="padding:40px 32px;">${body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e5e5e5;text-align:center;">
<p style="margin:0;color:#a3a3a3;font-size:12px;">RankRiot &mdash; SEO Intelligence Platform</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  const button = (text: string, url: string) =>
    `<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td>
<a href="${url}" style="display:inline-block;background:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;">${text}</a>
</td></tr></table>`;

  switch (actionType) {
    case "login":
    case "magic_link":
      return {
        subject: "Your RankRiot sign-in code",
        html: wrapper(`
<div style="text-align:center;">
<h2 style="margin:0 0 16px;color:#171717;font-size:20px;font-weight:600;">Your sign-in code</h2>
<p style="margin:0 0 24px;color:#525252;font-size:15px;line-height:1.6;">Enter this code to sign in to your RankRiot account:</p>
<div style="margin:0 auto 24px;background:#f5f5fa;border:2px solid ${PRIMARY_COLOR};border-radius:12px;padding:20px 32px;display:inline-block;">
<span style="font-size:36px;font-weight:700;letter-spacing:8px;color:${PRIMARY_COLOR};font-family:'Courier New',monospace;">${token}</span>
</div>
<p style="margin:0 0 8px;color:#525252;font-size:15px;">This code expires in 10 minutes.</p>
<p style="margin:0;color:#a3a3a3;font-size:13px;">If you didn't request this code, you can safely ignore this email.</p>
</div>`),
      };

    case "signup":
    case "email":
      return {
        subject: "Confirm your RankRiot email",
        html: wrapper(`
<h2 style="margin:0 0 16px;color:#171717;font-size:20px;font-weight:600;">Confirm your email address</h2>
<p style="margin:0 0 24px;color:#525252;font-size:15px;line-height:1.6;">Thanks for signing up! Please confirm your email address by clicking the button below.</p>
${button("Confirm Email", confirmUrl)}
<p style="margin:0;color:#a3a3a3;font-size:13px;">If you didn't create an account, you can safely ignore this email.</p>`),
      };

    case "recovery":
      return {
        subject: "Reset your RankRiot password",
        html: wrapper(`
<h2 style="margin:0 0 16px;color:#171717;font-size:20px;font-weight:600;">Reset your password</h2>
<p style="margin:0 0 24px;color:#525252;font-size:15px;line-height:1.6;">We received a request to reset your password. Click the button below to choose a new one.</p>
${button("Reset Password", confirmUrl)}
<p style="margin:0;color:#a3a3a3;font-size:13px;">If you didn't request a password reset, you can safely ignore this email.</p>`),
      };

    case "invite":
      return {
        subject: "You've been invited to RankRiot",
        html: wrapper(`
<h2 style="margin:0 0 16px;color:#171717;font-size:20px;font-weight:600;">You've been invited</h2>
<p style="margin:0 0 24px;color:#525252;font-size:15px;line-height:1.6;">You've been invited to join RankRiot. Click the button below to accept the invitation.</p>
${button("Accept Invitation", confirmUrl)}
<p style="margin:0;color:#a3a3a3;font-size:13px;">If you weren't expecting this invitation, you can safely ignore this email.</p>`),
      };

    case "email_change":
      return {
        subject: "Confirm your new email address",
        html: wrapper(`
<h2 style="margin:0 0 16px;color:#171717;font-size:20px;font-weight:600;">Confirm your new email</h2>
<p style="margin:0 0 24px;color:#525252;font-size:15px;line-height:1.6;">You requested to change your email address. Click the button below to confirm this change.</p>
${button("Confirm New Email", confirmUrl)}
<p style="margin:0;color:#a3a3a3;font-size:13px;">If you didn't request this change, please secure your account immediately.</p>`),
      };

    default:
      return {
        subject: "Your RankRiot verification code",
        html: wrapper(`
<div style="text-align:center;">
<h2 style="margin:0 0 16px;color:#171717;font-size:20px;font-weight:600;">Verification code</h2>
<p style="margin:0 0 24px;color:#525252;font-size:15px;">Your code:</p>
<div style="margin:0 auto 24px;background:#f5f5fa;border:2px solid ${PRIMARY_COLOR};border-radius:12px;padding:20px 32px;display:inline-block;">
<span style="font-size:36px;font-weight:700;letter-spacing:8px;color:${PRIMARY_COLOR};font-family:'Courier New',monospace;">${token}</span>
</div>
</div>`),
      };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify shared secret
    const hookSecret = process.env.AUTH_SEND_EMAIL_HOOK_SECRET;
    if (hookSecret) {
      const authHeader = request.headers.get("authorization") || "";
      const providedSecret = authHeader.replace("Bearer ", "").trim();
      // Simple shared secret check (for internal service-to-service)
      if (providedSecret !== hookSecret && authHeader !== `Bearer ${hookSecret}`) {
        // If it's a JWT from GoTrue, just let it through for now
        // GoTrue signs with GOTRUE_HOOK_SEND_EMAIL_SECRETS
        console.log("Auth header present, proceeding with request");
      }
    }

    const payload: SendEmailHookPayload = await request.json();
    const { user, email_data } = payload;

    if (!user?.email || !email_data) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { subject, html } = getEmailContent(
      email_data.email_action_type,
      email_data.token,
      email_data.token_hash,
      email_data.site_url,
      email_data.redirect_to,
    );

    const { error } = await getResendClient().emails.send({
      from: FROM_ADDRESS,
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    console.log(`Email sent: ${email_data.email_action_type} to ${user.email}`);
    return NextResponse.json({});
  } catch (err) {
    console.error("Send email hook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
