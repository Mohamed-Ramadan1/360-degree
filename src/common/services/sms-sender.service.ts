import { LoggerService } from 'src/logs/logger.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsSenderService implements OnModuleInit {
  private client: twilio.Twilio;
  private fromNumber: string | undefined;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    const accountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = configService.get<string>('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !this.fromNumber) {
      this.logger.warn('Twilio credentials are missing in configuration');
      return;
    }

    this.client = twilio(accountSid, authToken);
  }

  onModuleInit() {
    if (!this.client) {
      this.logger.warn('Twilio client was not initialized');
    } else {
      this.logger.log('Twilio client initialized successfully');
    }
  }
  async send(to: string, message: string) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      return { success: true, sid: result.sid };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error('Failed to send SMS', err, this.constructor.name);
      throw err;
    }
  }
}
