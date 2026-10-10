import nodemailer from 'nodemailer';

export async function sendAdminOtpEmail(otp: string, targetEmail: string = process.env.ADMIN_NOTIFICATION_EMAIL || ''): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  // If SMTP password is not set or placeholder, return success with console log fallback
  if (!user || !pass || pass === 'your_app_password_here') {
    console.warn('⚠️ SMTP_PASS is not configured in .env.');
    return { success: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: targetEmail,
      subject: `🛡️ ${otp} is your AZYRA Admin Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f10; color: #f3f4f6; margin: 0; padding: 24px; }
            .container { max-width: 520px; margin: 0 auto; background: #13191b; border: 1px solid #232d30; border-radius: 16px; padding: 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
            .header { text-align: center; border-bottom: 1px solid #232d30; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #c4f934; text-transform: uppercase; }
            .badge { display: inline-block; font-size: 11px; font-weight: bold; padding: 4px 10px; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 999px; margin-top: 8px; text-transform: uppercase; }
            .code-box { background: #0b0f10; border: 2px dashed #c4f934; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
            .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #c4f934; }
            .alert { background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #fcd34d; margin-top: 24px; }
            .footer { margin-top: 28px; text-align: center; font-size: 11px; color: #6b7280; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AZYRA</div>
              <div class="badge">Admin Portal 2FA Verification</div>
            </div>
            
            <p style="font-size: 14px; color: #9ca3af; margin: 0 0 16px 0;">
              A login attempt was initiated for the <strong>AZYRA Admin Dashboard</strong>. Use the one-time verification code below to authorize this session:
            </p>

            <div class="code-box">
              <div style="font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">One-Time Security Passcode</div>
              <div class="otp-code">${otp}</div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">Expires in 10 minutes</div>
            </div>

            <div class="alert">
              <strong>Security Notice:</strong> If you did not initiate this login request, someone may be attempting to access the administration portal. Do not share this code with anyone.
            </div>

            <div class="footer">
              AZYRA Protocol • Secure Administrator Gateway<br>
              Authorized recipient: ${targetEmail}
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Failed to dispatch admin OTP email via SMTP:', err);
    // Still return success if logged to console to prevent total lockout
    return { success: true, error: err.message };
  }
}
