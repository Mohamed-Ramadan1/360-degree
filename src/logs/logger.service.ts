import * as winston from 'winston';
import { Injectable } from '@nestjs/common';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { format, Logger, transports } from 'winston';
import * as fs from 'fs';

@Injectable()
export class LoggerService {
  private logger: Logger;
  private logDirectory: string = process.env.LOG_DIR || 'logging';
  private isProduction: boolean = process.env.NODE_ENV === 'production';

  constructor() {}
  onModuleInit() {
    try {
      if (!fs.existsSync(this.logDirectory)) {
        fs.mkdirSync(this.logDirectory, { recursive: true });
      }

      this.logger = winston.createLogger({
        level: 'info',
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.json(),
        ),

        defaultMeta: { service: 'global-app' },

        transports: [
          // Console output (formatted differently in dev)
          new transports.Console({
            format: this.isProduction
              ? format.json()
              : format.combine(format.colorize(), format.simple()),
          }),

          // Rotating file transport for application logs
          new DailyRotateFile({
            dirname: `${this.logDirectory}/app`,
            filename: `application-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '14d',
          }),
        ],

        // Log uncaught exceptions
        exceptionHandlers: [
          new DailyRotateFile({
            dirname: `${this.logDirectory}/exceptions`,
            filename: 'exceptions-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '30d',
          }),
        ],

        // Log unhandled promise rejections
        rejectionHandlers: [
          new DailyRotateFile({
            dirname: `${this.logDirectory}/rejections`,
            filename: 'rejections-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '30d',
          }),
        ],
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to create log directory:', error.message);
      throw error;
    }
  }

  log(message: string, context?: string) {
    this.logger?.info(message, { context });
  }

  error(
    message: string,
    error?: Error | string,
    context: string = 'Application',
  ) {
    if (error instanceof Error) {
      this.logger?.error(message, {
        context,
        error: error.message,
        stack: error.stack,
      });
    } else {
      this.logger?.error(message, {
        context,
        error,
      });
    }
  }

  warn(message: string, context?: string) {
    this.logger?.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger?.debug(message, { context });
  }
}
