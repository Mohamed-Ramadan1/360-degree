interface PasswordResetEmailData {
  userEmail: string;
  userName: string;
  resetToken: string;
  expiresInMinutes?: number;
  platformUrl?: string;
  supportEmail?: string;
  companyName?: string;
}

export function generatePasswordResetEmail(
  data: PasswordResetEmailData,
): string {
  const {
    userEmail,
    userName,
    resetToken,
    expiresInMinutes = 15,
    platformUrl = 'http://localhost:3000/api/v1',
    supportEmail = 'support@360-degree.com',
    companyName = '360-degree',
  } = data;

  const resetUrl = `${platformUrl}/auth/recover/reset-password?token=${resetToken}`;

  return `
  <div style="background:#f4f6f9;padding:40px 0;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background:#111827;color:#ffffff;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:22px;">${companyName}</h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <h2 style="margin-top:0;color:#111827;font-size:20px;">
          Password Reset Request
        </h2>

        <p style="color:#4b5563;font-size:15px;">
          Hello ${userName},
        </p>

        <p style="color:#4b5563;font-size:15px;">
          We received a request to reset the password for your account associated with:
        </p>

        <p style="font-weight:600;color:#111827;">
          ${userEmail}
        </p>

        <p style="color:#4b5563;font-size:15px;">
          If you made this request, click the button below to create a new password.
        </p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}"
             style="background:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;">
             Reset Password
          </a>
        </div>

        <p style="font-size:13px;color:#dc2626;text-align:center;font-weight:600;">
          This link will expire in ${expiresInMinutes} minutes.
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

        <p style="color:#4b5563;font-size:14px;">
          If you did not request a password reset, you can safely ignore this email. 
          Your account remains secure.
        </p>

        <p style="color:#4b5563;font-size:14px;">
          For additional assistance, contact us at 
          <a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none;">
            ${supportEmail}
          </a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px;text-align:center;font-size:13px;color:#6b7280;">
        <p style="margin:0;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `;
}
