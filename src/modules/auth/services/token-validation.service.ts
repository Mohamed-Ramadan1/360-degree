import { UnauthorizedException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

import {
  TokenType,
  ITokenValidationService,
  AppJwtPayload,
} from '../interfaces/tokens/tokenValidation.interface';

import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class TokenValidationService implements ITokenValidationService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const accessTokenSecret = this.config.get<string>('ACCESS_TOKEN_SECRET');
    const refreshTokenSecret = this.config.get<string>('REFRESH_TOKEN_SECRET');

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error(
        'ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are required',
      );
    }

    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
  }
  /**
   * Validates a JSON Web Token and checks its expiration
   * @param token - The JWT string to validate (with or without "Bearer " prefix)
   * @param type - The type of token ("access" or "refresh")
   * @returns {AppJwtPayload} The validated JWT payload
   * @throws Will throw an error via errorUtils if validation fails
   */
  validate(token: string, type: TokenType): AppJwtPayload {
    try {
      const tokenString = this.extractToken(token);
      return this.decodeToken(tokenString, type);
    } catch (error: any) {
      this.logger.error(
        'Token validation error',
        error as Error,
        TokenValidationService.name,
      );
      throw new UnauthorizedException(error.message);
    }
  }

  /**
   * Extracts the payload from a JSON Web Token
   * @param token - The JWT string to decode (with or without "Bearer " prefix)
   * @param type - The type of token ("access" or "refresh")
   * @returns {AppJwtPayload} The decoded JWT payload
   * @throws Will throw an error via errorUtils if decoding fails
   */
  getPayload(token: string, type: TokenType): AppJwtPayload {
    return this.decodeToken(this.extractToken(token), type);
  }

  /**
   * Removes the "Bearer " prefix from a token string
   * @param token - The token string to process
   * @returns {string} The token without the "Bearer " prefix
   */
  private extractToken(token: string): string {
    if (!token?.trim()) {
      this.logger.warn('Empty token provided', TokenValidationService.name);
      throw new UnauthorizedException('Token is required');
    }
    const trimmed = token.trim();
    return trimmed.startsWith('Bearer ') ? trimmed.slice(7) : trimmed;
  }

  /**
   * Decodes and verifies a JSON Web Token
   * @param token - The JWT string to decode
   * @param type - The type of token ("access" or "refresh")
   * @returns {AppJwtPayload} The decoded JWT payload
   * @throws Will throw an error via errorUtils if decoding/verification fails
   */
  private decodeToken(token: string, type: TokenType): AppJwtPayload {
    try {
      return verify(token, this.getSecret(type)) as AppJwtPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }

  /**
   * Retrieves the appropriate secret for the token type
   * @param type - The type of token ("access" or "refresh")
   * @returns {string} The secret key for verifying the token
   */
  private getSecret(type: TokenType): string {
    if (type !== 'access' && type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    return type === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;
  }
}
