import { JwtPayload } from 'jsonwebtoken';

export type TokenType = 'access' | 'refresh';

export interface AppJwtPayload extends JwtPayload {
  sub: string; // userId
  userId: string; // User identifier
  type: 'access' | 'refresh'; // Token type
  jti: string; // JWT ID for unique token identification
  role?: string; // User role (optional)
}

export interface ITokenValidationService {
  /**
   * Validates a JWT and returns the decoded payload with full type information.
   * The payload includes user ID, token type, JWT ID (jti), and optional role.
   * @param token - The JWT string (with or without "Bearer " prefix)
   * @param type - The token type ("access" or "refresh")
   * @returns {AppJwtPayload} The validated JWT payload with jti and type information
   * @throws {UnauthorizedException} If the token is invalid or expired
   */
  validate(token: string, type: TokenType): AppJwtPayload;

  /**
   * Extracts the payload from a JWT without re-checking validity.
   * Returns the complete payload structure including JWT ID (jti) for token tracking.
   * @param token - The JWT string (with or without "Bearer " prefix)
   * @param type - The token type ("access" or "refresh")
   * @returns {AppJwtPayload} The decoded JWT payload with jti and type information
   * @throws {UnauthorizedException} If decoding fails
   */
  getPayload(token: string, type: TokenType): AppJwtPayload;
}
