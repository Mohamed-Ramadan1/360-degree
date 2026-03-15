interface HabitReminderEmailData {
  userName: string;
  habitTitle: string;
  habitAt: string;
  habitId: string;

  platformUrl?: string;
  supportEmail?: string;
  companyName?: string;
}

export function generateHabitReminderEmail(
  data: HabitReminderEmailData,
): string {
  const {
    userName,
    habitTitle,
    habitAt,
    habitId,
    platformUrl = 'http://localhost:3000',
    supportEmail = 'support@360-degree.com',
    companyName = '360-degree',
  } = data;

  const habitUrl = `${platformUrl}/habits/${habitId}`;
  const formattedTime = formatHabitTime(habitAt);
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
          🔔 Habit Reminder, ${userName}
        </h2>

        <p style="color:#4b5563;font-size:15px;">
          It's time to complete one of your habits.
        </p>

        <!-- Habit Box -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:20px;margin:25px 0;">
          <p style="margin:0;font-weight:600;color:#111827;font-size:15px;">
            ${habitTitle}
          </p>

          ${
            habitAt
              ? `<p style="margin:8px 0 0 0;color:#4b5563;font-size:13px;">
                Time: ${formattedTime}
              </p>`
              : ''
          }
        </div>

        <!-- Button -->
        <div style="text-align:center;margin:30px 0;">
          <a href="${habitUrl}" 
            style="background:#2563eb;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
            View Habit
          </a>
        </div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;" />

        <p style="color:#4b5563;font-size:13px;">
          If you need help, contact us at 
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
        <p style="margin:6px 0 0 0;">
          <a href="${platformUrl}" style="color:#2563eb;text-decoration:none;">
            Visit Platform
          </a>
        </p>
      </div>

    </div>
  </div>
  `;
}

function formatHabitTime(time: string) {
  const [hour, minute] = time.split(':').map(Number);

  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
}
