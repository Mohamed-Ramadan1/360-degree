import { UserRoles } from 'src/common/consts';
interface NewRolesAddedEmailData {
  userName: string;
  addedRoles: UserRoles[];
  platformUrl?: string;
  supportEmail?: string;
  companyName?: string;
}

const updateDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const roleConfigurations = {
  [UserRoles.ADMIN]: {
    name: 'Administrator',
    permissions: [
      'Manage users and teams',
      'Configure workspace settings',
      'Access analytics and reports',
      'Manage projects and resources',
    ],
  },
  [UserRoles.SUPER_ADMIN]: {
    name: 'Super Administrator',
    permissions: [
      'Full platform access',
      'Manage administrators and roles',
      'Security configuration',
      'Organization-wide settings',
    ],
  },
  [UserRoles.SUPPORT_ADMIN]: {
    name: 'Support Administrator',
    permissions: [
      'Manage support team',
      'Access all tickets',
      'Support analytics',
      'Knowledge base management',
    ],
  },
  [UserRoles.SUPPORT_AGENT]: {
    name: 'Support Agent',
    permissions: [
      'Respond to inquiries',
      'Manage assigned tickets',
      'Access support tools',
      'Update user data',
    ],
  },
  [UserRoles.USER]: {
    name: 'User',
    permissions: [
      'Manage personal tasks',
      'Collaborate with teams',
      'Track goals and progress',
      'Update profile',
    ],
  },
};

export function generateNewRolesAddedEmail(
  data: NewRolesAddedEmailData,
): string {
  const {
    userName,
    addedRoles,
    platformUrl = 'http://localhost:3000/api/v1',
    supportEmail = 'support@360-degree.com',
    companyName = '360-degree',
  } = data;

  const rolesHtml = addedRoles
    .map((role) => {
      const config = roleConfigurations[role];

      return `
      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:15px;">
        
        <p style="margin:0 0 10px 0;font-weight:600;color:#111827;font-size:14px;">
          ${config.name}
        </p>

        ${config.permissions
          .map(
            (perm) => `
          <p style="margin:4px 0;color:#4b5563;font-size:13px;">
            ✓ ${perm}
          </p>
        `,
          )
          .join('')}
      </div>
      `;
    })
    .join('');

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
          New roles have been assigned to your account.
          You now have additional permissions inside ${companyName}.
        </p>

        <!-- Success Box -->
        <div style="background:#ecfdf5;border:1px solid #10b981;border-radius:6px;padding:20px;margin:25px 0;">
          <p style="margin:0;font-weight:600;color:#047857;font-size:14px;">
            Permissions Updated Successfully
          </p>
          <p style="margin:6px 0 0 0;color:#065f46;font-size:13px;">
            Update Date: ${updateDate}
          </p>
        </div>

        <!-- Roles -->
        ${rolesHtml}

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
export function getRoleDisplayName(role: UserRoles): string {
  return roleConfigurations[role]?.name || role;
}

export function getRolePermissions(roles: UserRoles[]): string[] {
  const allPermissions = new Set<string>();

  roles.forEach((role) => {
    roleConfigurations[role]?.permissions.forEach((p) => {
      allPermissions.add(p);
    });
  });

  return Array.from(allPermissions);
}
