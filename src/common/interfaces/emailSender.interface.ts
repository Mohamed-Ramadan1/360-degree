/**
 * Email sender service for handling SMTP email operations.
 *
 * This service provides functionality to send emails using nodemailer with SMTP configuration.
 * It initializes the email transporter on module initialization and provides methods for sending emails.
 *
 * @example
 * ```typescript
 *  Usage in a controller or another service
 * constructor(private emailService: EmailSenderService) {}
 *
 * async sendWelcomeEmail(userEmail: string) {
 *   await this.emailService.sendEmail(
 *     userEmail,
 *     'Welcome!',
 *     'Welcome to our platform!',
 *     '<h1>Welcome to our platform!</h1>'
 *   );
 * }
 * ```
 *
 * @requires EMAIL_HOST - SMTP server hostname
 * @requires EMAIL_PORT - SMTP server port (465 for SSL, 587 for TLS)
 * @requires EMAIL_USER - SMTP authentication username
 * @requires EMAIL_PASSWORD - SMTP authentication password
 * @requires EMAIL_FROM - Sender email address
 * @requires EMAIL_FROM_NAME - Sender display name
 *
 * @throws {Error} When required environment variables are missing
 * @throws {Error} When email transporter initialization fails
 * @throws {Error} When email sending fails
 *
 * @since 1.0.0
 * @author Your Team
 */
export interface EmailSenderServiceInterface {
  /**
   * Initializes the email transporter when the module starts.
   *
   * This method is automatically called by NestJS during module initialization.
   * It creates the nodemailer transporter and verifies the SMTP connection.
   *
   * @returns Promise that resolves when transporter is successfully initialized
   * @throws {Error} When transporter initialization or verification fails
   *
   * @example
   * ```typescript
   * // This is called automatically by NestJS, no manual invocation needed
   * ```
   */
  onModuleInit(): Promise<void>;

  /**
   * Sends an email to the specified recipient using the configured SMTP transporter.
   *
   * @param to - The recipient's email address (must be a valid email format)
   * @param subject - The subject line of the email
   * @param text - The plain text body content of the email
   * @param html - Optional HTML body content of the email (takes precedence over text in email clients that support HTML)
   *
   * @returns Promise that resolves when the email is sent successfully
   * @throws {Error} When transporter is not initialized
   * @throws {Error} When email sending fails (invalid recipient, SMTP errors, network issues, etc.)
   *
   * @example
   * ```typescript
   * // Send a plain text email
   * await emailService.sendEmail(
   *   'user@example.com',
   *   'Password Reset',
   *   'Click the link to reset your password: https://example.com/reset'
   * );
   *
   * // Send an HTML email with fallback text
   * await emailService.sendEmail(
   *   'user@example.com',
   *   'Welcome to Our Service',
   *   'Welcome! Visit our website to get started.',
   *   '<h1>Welcome!</h1><p>Visit <a href="https://example.com">our website</a> to get started.</p>'
   * );
   * ```
   *
   * @since 1.0.0
   */
  sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void>;
}

/**
 * Configuration interface for email SMTP settings.
 *
 * @interface EmailConfiguration
 */
export interface EmailConfiguration {
  /** SMTP server hostname (e.g., 'smtp.gmail.com', 'mail.example.com') */
  EMAIL_HOST: string;

  /** SMTP server port number (465 for SSL, 587 for TLS, 25 for non-secure) */
  EMAIL_PORT: number;

  /** SMTP authentication username (usually an email address) */
  EMAIL_USER: string;

  /** SMTP authentication password or app-specific password */
  EMAIL_PASSWORD: string;

  /** Sender email address that will appear in the 'From' field */
  EMAIL_FROM: string;

  /** Display name for the sender that will appear alongside the email address */
  EMAIL_FROM_NAME: string;
}

/**
 * Email message options interface.
 *
 * @interface EmailOptions
 */
export interface EmailOptions {
  /** Recipient email address */
  to: string;

  /** Email subject line */
  subject: string;

  /** Plain text body content */
  text: string;

  /** Optional HTML body content */
  html?: string;

  /** Optional sender override (uses default if not provided) */
  from?: string;

  /** Optional CC recipients */
  cc?: string | string[];

  /** Optional BCC recipients */
  bcc?: string | string[];

  /** Optional reply-to address */
  replyTo?: string;

  /** Optional email attachments */
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Email sending result interface.
 *
 * @interface EmailSendResult
 */
export interface EmailSendResult {
  /** Whether the email was sent successfully */
  success: boolean;

  /** Message ID from the email provider */
  messageId?: string;

  /** Error message if sending failed */
  error?: string;

  /** Timestamp when the email was sent */
  sentAt: Date;

  /** Recipient email address */
  recipient: string;
}
