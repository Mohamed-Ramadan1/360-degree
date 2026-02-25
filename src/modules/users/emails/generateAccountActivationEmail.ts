import { IUser } from 'src/modules/users/interfaces/entities/user.interface';

interface AccountActivationData {
  user: Pick<IUser, 'id' | 'name' | 'email'>;
  activationDate: Date;
  platformUrl?: string;
  supportEmail?: string;
  companyName?: string;
}

export function generateAccountActivationEmail(
  data: AccountActivationData,
): string {
  const {
    user,
    activationDate,
    platformUrl = 'https://360-degree.com',
    supportEmail = 'support@360-degree.com',
    companyName = '360-degree',
  } = data;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(activationDate);

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
          We’re happy to inform you that your account has been successfully activated.
          You now have full access to all platform features.
        </p>

        <div style="background:#ecfdf5;border:1px solid #10b981;padding:20px;border-radius:6px;margin:25px 0;text-align:center;">
          <p style="margin:0;color:#047857;font-weight:600;font-size:15px;">
            ✅ Account Activated
          </p>
          <p style="margin:6px 0 0 0;color:#065f46;font-size:13px;">
            Activation Date: ${formattedDate}
          </p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${platformUrl}"
             style="background:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;">
             Go to Dashboard
          </a>
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

        <p style="color:#4b5563;font-size:14px;">
          You can start exploring the platform anytime.
        </p>

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
