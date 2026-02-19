interface CongratulationsEmailData {
  userName: string;
  platformUrl?: string;
  supportEmail?: string;
  marketplaceUrl?: string;
  communityUrl?: string;
  companyName?: string;
}

export function generateCongratulationsEmail(
  data: CongratulationsEmailData,
): string {
  const {
    userName,
    platformUrl = 'http://localhost:3000/api/v1',
    supportEmail = 'support@360-degree.com',
    companyName = '360-degree',
  } = data;

  const activationDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
          🎉 Congratulations, ${userName}!
        </h2>

        <p style="color:#4b5563;font-size:15px;">
          Your account has been successfully verified and activated.
          You now have full access to everything on ${companyName}.
        </p>

        <!-- Success Box -->
        <div style="background:#ecfdf5;border:1px solid #10b981;border-radius:6px;padding:20px;margin:25px 0;">
          <p style="margin:0;font-weight:600;color:#047857;font-size:14px;">
            Account Activated
          </p>
          <p style="margin:6px 0 0 0;color:#065f46;font-size:13px;">
            Activation Date: ${activationDate}
          </p>
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

        <p style="color:#4b5563;font-size:13px;">
          If you need assistance, contact us at 
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
