interface TodoReminderEmailData {
  userName: string;
  todoTitle: string;
  reminderAt: Date;
  priority: string;
  todoId: string;

  platformUrl?: string;
  supportEmail?: string;
  companyName?: string;
}

export function generateTodoReminderEmail(data: TodoReminderEmailData): string {
  const {
    userName,
    todoTitle,
    reminderAt,
    priority,
    todoId,
    platformUrl = 'http://localhost:3000',
    supportEmail = 'support@360-degree.com',
    companyName = '360-degree',
  } = data;

  const formattedReminder = new Date(reminderAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const todoUrl = `${platformUrl}/todos/${data.todoId}`;

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
          ⏰ Reminder, ${userName}
        </h2>

        <p style="color:#4b5563;font-size:15px;">
          This is a reminder for one of your tasks.
        </p>

        <!-- Todo Box -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:20px;margin:25px 0;">
          <p style="margin:0;font-weight:600;color:#111827;font-size:15px;">
            ${todoTitle}
          </p>

          ${`<p style="margin:8px 0 0 0;color:#4b5563;font-size:13px;">
                Reminder: ${formattedReminder}
              </p>`}

          ${
            priority
              ? `<p style="margin:6px 0 0 0;color:#4b5563;font-size:13px;">
                Priority: ${priority}
              </p>`
              : ''
          }
        </div>

        <!-- Button -->
        <div style="text-align:center;margin:30px 0;">
          <a href="${todoUrl}" 
            style="background:#2563eb;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
            View Task
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
