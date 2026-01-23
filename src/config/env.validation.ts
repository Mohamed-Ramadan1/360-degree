import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsEnum, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  LOG_DIR: string;

  // Email Configuration
  @IsString()
  EMAIL_FROM_NAME: string;

  @IsString()
  EMAIL_FROM: string;

  @IsString()
  EMAIL_USER: string;

  @IsString()
  EMAIL_PASSWORD: string;

  @IsNumber()
  EMAIL_PORT: number;

  @IsString()
  EMAIL_HOST: string;

  // AWS S3 Configuration
  @IsString()
  AWS_REGION: string;

  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  S3_BUCKET_NAME: string;

  // JWT Configuration
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  ACCESS_TOKEN_EXPIRATION: string;

  @IsString()
  REFRESH_TOKEN_EXPIRATION: string;

  @IsString()
  LOGOUT_TOKEN_SECRET: string;

  @IsString()
  LOGOUT_TOKEN_EXPIRATION: string;

  @IsNumber()
  COOKIE_EXPIRATION: number;

  @IsString()
  JWT_ISSUER: string;

  // OpenAI Configuration
  @IsString()
  OPENAI_API_KEY: string;

  // Redis Configuration
  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
