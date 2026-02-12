import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggerService } from 'src/logs/logger.service';
@Injectable()
export class EmailSenderService implements OnModuleInit {
  private readonly emailSmtpHost: string | undefined;
  private readonly emailSmtpPort: number | undefined;
  private readonly emailSmtpUser: string | undefined;
  private readonly emailSmtpPass: string | undefined;
  private readonly fromEmail: string | undefined;
  private readonly fromName: string | undefined;
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.emailSmtpHost = this.configService.get<string>('EMAIL_HOST');
    this.emailSmtpPort = this.configService.get<number>('EMAIL_PORT');
    this.emailSmtpUser = this.configService.get<string>('EMAIL_USER');
    this.emailSmtpPass = this.configService.get<string>('EMAIL_PASSWORD');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME');

    if (
      !this.emailSmtpHost ||
      !this.emailSmtpPort ||
      !this.emailSmtpUser ||
      !this.emailSmtpPass ||
      !this.fromEmail ||
      !this.fromName
    ) {
      throw new Error(
        'Email SMTP configuration is missing in environment variables.',
      );
    }
  }

  /**
   * Initialize the email transporter when the module starts
   */
  async onModuleInit(): Promise<void> {
    try {
      this.transporter = this.createMailTransporter();

      // Optional: Verify the connection
      await this.transporter.verify();

      this.logger.log(
        'Email transporter initialized successfully',
        EmailSenderService.name,
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize email transporter',
        error as Error,
        EmailSenderService.name,
      );
      throw error;
    }
  }

  // create transporter with private method
  /**
   * Creates a nodemailer transporter instance with the configured SMTP settings.
   * @returns A nodemailer Transporter object for sending emails.
   */
  private createMailTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: this.emailSmtpHost,
      port: this.emailSmtpPort,
      secure: this.emailSmtpPort === 465,
      auth: {
        user: this.emailSmtpUser,
        pass: this.emailSmtpPass,
      },
    });
  }
  /**
   * Sends an email to the specified recipient.
   * @param to - The recipient's email address.
   * @param subject - The subject of the email.
   * @param text - The plain text body of the email.
   * @param html - The HTML body of the email (optional).
   * @returns A promise that resolves when the email is sent successfully.
   * @throws Error if the email sending fails.
   */
  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    if (!this.transporter) {
      const error = new Error(
        'Email transporter not initialized. Service may have failed to start properly.',
      );
      this.logger.error(
        'Attempted to send email with uninitialized transporter',
        error,
        EmailSenderService.name,
      );
      throw error;
    }
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to ${to}:`,
        error as Error,
        EmailSenderService.name,
      );
      throw error;
    }
  }
}
