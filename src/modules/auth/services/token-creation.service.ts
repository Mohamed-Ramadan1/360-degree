// Core packages imports
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// external packages imports
import { sign, SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import ms from 'ms';

// interfaces imports
import {
  ITokenPair,
  ITokenGenerator,
  TokenGenerationPayload,
} from '../interfaces/tokens/tokenGeneration.interface';

// logs modules imports
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class TokenCreationService implements ITokenGenerator {
  /**
   * The secret key used to sign access tokens.
   */

  public readonly accessTokenSecret: string;

  /**
   * The secret key used to sign refresh tokens.
   */
  public readonly refreshTokenSecret: string;

  /**
   * The expiration time for access tokens, specified in a format compatible with the 'ms' library.
   */
  public readonly accessTokenExpiration: string;

  /**
   * The expiration time for refresh tokens, specified in a format compatible with the 'ms' library.
   */
  public readonly refreshTokenExpiration: string;
  /**
   * The issuer of the JWT tokens.
   */
  public readonly issuer: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const accessTokenSecret = this.config.get<string>('ACCESS_TOKEN_SECRET');
    const refreshTokenSecret = this.config.get<string>('REFRESH_TOKEN_SECRET');
    const accessTokenExpiration = this.config.get<string>(
      'ACCESS_TOKEN_EXPIRATION',
    );
    const refreshTokenExpiration = this.config.get<string>(
      'REFRESH_TOKEN_EXPIRATION',
    );
    const issuer = this.config.get<string>('JWT_ISSUER');

    if (
      !accessTokenSecret ||
      !refreshTokenSecret ||
      !accessTokenExpiration ||
      !refreshTokenExpiration ||
      !issuer
    ) {
      throw new InternalServerErrorException(
        'ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION, and JWT_ISSUER are required',
      );
    }
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
    this.accessTokenExpiration = accessTokenExpiration;
    this.refreshTokenExpiration = refreshTokenExpiration;
    this.issuer = issuer;
  }

  /**
   * Generates a unique JWT ID (jti) for token identification and revocation capabilities.
   * Uses UUID v4 for cryptographically secure random identifiers.
   * @returns A unique identifier string in UUID v4 format.
   */
  private generateJti(): string {
    return uuidv4();
  }

  /**
   * Generates a JWT token with the specified payload, secret, and signing options.
   * @param payload - The typed payload to include in the JWT.
   * @param secret - The secret key used to sign the token.
   * @param signOptions - The signing options for the token, such as expiration and issuer.
   * @returns The generated JWT token as a string.
   */
  private generateJwtToken(
    payload: TokenGenerationPayload,
    secret: string,
    signOptions: SignOptions,
  ): string {
    return sign(payload, secret, signOptions);
  }

  /**
   * Generates a pair of access and refresh tokens for a given user.
   * Each token includes a unique JWT ID (jti) claim for token identification and revocation capabilities.
   * @param userId - The unique identifier of the user.
   * @returns An object containing the access token and refresh token, both with unique JTI claims.
   * @throws BadRequestException if userId is invalid or missing.
   * @throws InternalServerErrorException if token generation fails.
   */
  generateTokenPair(userId: string): ITokenPair {
    if (!userId?.trim()) {
      throw new BadRequestException('Valid userId is required');
    }
    try {
      // Generate unique JTIs for both tokens
      const accessTokenJti = this.generateJti();
      const refreshTokenJti = this.generateJti();
      const accessToken: string = this.generateJwtToken(
        { userId, type: 'access', jti: accessTokenJti },
        this.accessTokenSecret,
        {
          expiresIn: this.accessTokenExpiration as ms.StringValue,
          issuer: this.issuer,
          subject: userId,
        },
      );

      const refreshToken: string = this.generateJwtToken(
        { userId, type: 'refresh', jti: refreshTokenJti },
        this.refreshTokenSecret,
        {
          expiresIn: this.refreshTokenExpiration as ms.StringValue,
          issuer: this.issuer,
          subject: userId,
        },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (err: any) {
      this.logger.error(
        'Error generating token pair',
        err as Error,
        TokenCreationService.name,
      );
      throw new InternalServerErrorException(
        `Token generation failed: ${err.message}`,
      );
    }
  }
}
