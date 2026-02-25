import { IUser } from 'src/modules/users/interfaces';

interface AccountDeactivationData {
  user: Pick<IUser, 'id' | 'name' | 'email'>;
  deactivationDate: Date;
  platformUrl?: string;
  supportEmail?: string;
  companyName?: string;
}

export function generateAccountDeactivationEmail(
  data: AccountDeactivationData,
): string {
  const {
    user,
    deactivationDate,
    platformUrl = 'https://360-degree.com',
    supportEmail = 'support@360-degree.com',
    companyName = '360-degree',
  } = data;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(deactivationDate);

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
          Hello ${user.name},
        </h2>

        <p style="color:#4b5563;font-size:15px;line-height:1.6;">
          This email confirms that your account has been successfully deactivated
          based on your request.
        </p>

        <div style="background:#fff7ed;border:1px solid #f97316;padding:20px;border-radius:6px;margin:25px 0;text-align:center;">
          <p style="margin:0;color:#ea580c;font-weight:600;font-size:15px;">
            ⏸️ Account Deactivated
          </p>
          <p style="margin:6px 0 0 0;color:#9a3412;font-size:13px;">
            Deactivation Date: ${formattedDate}
          </p>
        </div>

        <p style="color:#4b5563;font-size:14px;">
          Your data remains securely, and you can reactivate your account
          anytime by logging in again.
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

        <p>
          <a href="${platformUrl}" style="color:#2563eb;text-decoration:none;font-weight:600;">
            Visit ${companyName}
          </a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px;text-align:center;font-size:13px;color:#6b7280;">
        <p style="margin:0;">
          Need help? Contact us at 
          <a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none;">
            ${supportEmail}
          </a>
        </p>
        <p style="margin-top:8px;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `;
}
