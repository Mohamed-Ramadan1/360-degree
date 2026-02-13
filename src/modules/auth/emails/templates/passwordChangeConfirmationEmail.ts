interface PasswordUpdatedEmailData {
  userEmail: string;
  userName: string;
  platformUrl?: string;
  supportEmail?: string;
  updateTime?: Date;
  companyName?: string;
}

export function generatePasswordUpdatedEmail(
  data: PasswordUpdatedEmailData,
): string {
  const {
    userEmail,
    userName,
    platformUrl = 'http://localhost:3000/api/v1',
    supportEmail = 'support@360-degree.com',
    updateTime = new Date(),
    companyName = '360-degree',
  } = data;

  const updateTimeFormatted = updateTime.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

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
          Password Successfully Updated
        </h2>

        <p style="color:#4b5563;font-size:15px;">
          Hello ${userName},
        </p>

        <p style="color:#4b5563;font-size:15px;">
          This is a confirmation that your account password has been successfully updated.
        </p>

        <!-- Confirmation Box -->
        <div style="background:#ecfdf5;border:1px solid #10b981;border-radius:6px;padding:20px;margin:25px 0;">
          <p style="margin:0;font-weight:600;color:#047857;font-size:15px;">
            Your password was changed on:
          </p>
          <p style="margin:8px 0 0 0;color:#065f46;font-size:14px;">
            ${updateTimeFormatted}
          </p>
        </div>

        <!-- Account Info -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:20px;margin:25px 0;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:14px;">
            Account Details
          </p>
          <p style="margin:4px 0;color:#4b5563;font-size:14px;">
            Email: <strong>${userEmail}</strong>
          </p>
          <p style="margin:4px 0;color:#4b5563;font-size:14px;">
            Status: <span style="color:#10b981;font-weight:600;">Completed Successfully</span>
          </p>
        </div>

        <p style="color:#4b5563;font-size:14px;">
          For security reasons, all previous sessions have been invalidated. 
          Please log in again using your new password.
        </p>

        <!-- Login Button -->
        <div style="text-align:center;margin:30px 0;">
          <a href="${platformUrl}/auth/login"
             style="background:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;">
             Log In to Your Account
          </a>
        </div>

        <!-- Security Warning -->
        <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:6px;padding:18px;margin-top:25px;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#b91c1c;font-size:14px;">
            Didn’t make this change?
          </p>
          <p style="margin:0;color:#7f1d1d;font-size:13px;">
            If you did not update your password, contact our support team immediately at 
            <a href="mailto:${supportEmail}" style="color:#dc2626;text-decoration:none;">
              ${supportEmail}
            </a>
          </p>
        </div>

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
