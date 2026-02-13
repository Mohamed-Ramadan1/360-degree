import { IUser } from 'src/modules/users/interfaces/entities/user.interface';

interface WelcomeEmailData {
  user: Pick<IUser, 'id' | 'name' | 'email' | 'isVerified'>;
  verificationToken: string;
  tokenExpiryMinutes?: number;
  platformUrl?: string;
  supportEmail?: string;
  verificationUrl?: string;
  companyName?: string;
}

const backendPlatformUrl = 'http://localhost:3000/api/v1';

export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const {
    user,
    verificationToken,
    tokenExpiryMinutes = 30,
    platformUrl = 'https://360-degree.com',
    supportEmail = 'support@360-degree.com',
    companyName = '360-degree',
    verificationUrl = `${backendPlatformUrl}/auth/recovery/verify-email/${user.id}/${verificationToken}`,
  } = data;

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
          Welcome, ${user.name}
        </h2>

        <p style="color:#4b5563;font-size:15px;">
          Thank you for joining ${companyName}. We’re excited to have you as part of our growing community.
        </p>

        ${
          user.isVerified
            ? `
            <p style="color:#16a34a;font-weight:600;">
              Your email has been successfully verified.
            </p>
            `
            : `
            <p style="color:#4b5563;font-size:15px;">
              To activate your account, please confirm your email address by clicking the button below.
            </p>

            <div style="text-align:center;margin:30px 0;">
              <a href="${verificationUrl}"
                 style="background:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;">
                 Verify Email
              </a>
            </div>

            <p style="font-size:13px;color:#6b7280;text-align:center;">
              This link will expire in ${tokenExpiryMinutes} minutes.
            </p>
            `
        }

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

        <p style="color:#4b5563;font-size:14px;">
          You can explore the platform anytime:
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
