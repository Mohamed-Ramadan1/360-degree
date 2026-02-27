import { UserRoles } from 'src/common/consts';

interface RolesRemovedEmailData {
  userName: string;
  removedRoles: UserRoles[];
  remainingRoles?: UserRoles[];
  removalReason?: string;
  platformUrl?: string;
  supportEmail?: string;
  adminContact?: string;
  companyName?: string;
}

const roleConfigurations = {
  [UserRoles.ADMIN]: {
    name: 'Administrator',
    permissions: [
      'Manage users and teams',
      'Manage platform resources',
      'Access reports and analytics',
      'System configuration',
    ],
  },
  [UserRoles.SUPER_ADMIN]: {
    name: 'Super Administrator',
    permissions: [
      'Full system access',
      'Manage admins and roles',
      'Security settings',
      'Organization configuration',
    ],
  },
  [UserRoles.SUPPORT_ADMIN]: {
    name: 'Support Administrator',
    permissions: [
      'Manage support team',
      'Access all tickets',
      'Support analytics',
      'Knowledge base',
    ],
  },
  [UserRoles.SUPPORT_AGENT]: {
    name: 'Support Agent',
    permissions: [
      'Handle customer requests',
      'Manage assigned tickets',
      'Support tools access',
      'Update customer data',
    ],
  },
  [UserRoles.USER]: {
    name: 'User',
    permissions: [
      'Use platform features',
      'Manage profile',
      'Collaborate with team',
      'Track activity',
    ],
  },
};

export function generateRolesRemovedEmail(data: RolesRemovedEmailData): string {
  const {
    userName,
    removedRoles,
    remainingRoles = [],
    removalReason,
    platformUrl = 'http://localhost:3000',
    supportEmail = 'support@360-degree.com',
    adminContact,
    companyName = '360-degree',
  } = data;

  const updateDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const removedRolesHtml = removedRoles
    .map((role) => {
      const config = roleConfigurations[role];
      return `
      <div style="border:1px solid #fecaca;background:#fef2f2;border-radius:6px;padding:16px;margin-bottom:12px;">
        <p style="margin:0 0 8px 0;font-weight:600;color:#b91c1c;">
          ${config.name}
        </p>
        ${config.permissions
          .map(
            (perm) => `
          <p style="margin:4px 0;color:#7f1d1d;font-size:13px;">
            - ${perm}
          </p>
        `,
          )
          .join('')}
      </div>
      `;
    })
    .join('');

  const remainingRolesHtml =
    remainingRoles.length > 0
      ? `
      <div style="margin-top:25px;">
        <h3 style="color:#047857;font-size:16px;margin-bottom:10px;">
          Remaining Active Roles
        </h3>
        ${remainingRoles
          .map((role) => {
            const config = roleConfigurations[role];
            return `
            <div style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:6px;padding:16px;margin-bottom:12px;">
              <p style="margin:0 0 8px 0;font-weight:600;color:#065f46;">
                ${config.name}
              </p>
              ${config.permissions
                .map(
                  (perm) => `
                <p style="margin:4px 0;color:#065f46;font-size:13px;">
                  - ${perm}
                </p>
              `,
                )
                .join('')}
            </div>
            `;
          })
          .join('')}
      </div>
      `
      : '';

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
          Account Permissions Updated
        </h2>

        <p style="color:#4b5563;font-size:15px;">
          Hello ${userName}, some roles have been removed from your account.
          Your permissions have been updated accordingly.
        </p>

        <!-- Update Box -->
        <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:6px;padding:20px;margin:25px 0;">
          <p style="margin:0;font-weight:600;color:#b91c1c;font-size:14px;">
            Roles Removed Successfully
          </p>
          <p style="margin:6px 0 0 0;color:#7f1d1d;font-size:13px;">
            Update Date: ${updateDate}
          </p>
        </div>

        ${
          removalReason
            ? `
        <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:6px;padding:16px;margin-bottom:20px;">
          <p style="margin:0;font-weight:600;color:#9a3412;font-size:14px;">
            Reason
          </p>
          <p style="margin:6px 0 0 0;color:#7c2d12;font-size:13px;">
            ${removalReason}
          </p>
        </div>
        `
            : ''
        }

        <h3 style="color:#b91c1c;font-size:16px;margin-bottom:10px;">
          Removed Roles
        </h3>

        ${removedRolesHtml}

        ${remainingRolesHtml}

        <div style="background:#eff6ff;border:1px solid #3b82f6;border-radius:6px;padding:16px;margin-top:25px;">
          <p style="margin:0;color:#1e40af;font-size:13px;">
            This change takes effect immediately.
            ${
              adminContact
                ? ` For questions contact: ${adminContact}`
                : ' Contact support if you have questions.'
            }
          </p>
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

        <p style="color:#4b5563;font-size:13px;text-align:center;">
          Need help? Contact 
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
