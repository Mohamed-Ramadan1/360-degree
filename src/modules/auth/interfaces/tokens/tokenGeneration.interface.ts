/**
 * Interface defining the structure of JWT payload for token generation.
 */
export interface TokenGenerationPayload {
  /**
   * The unique identifier of the user.
   */
  userId: string;

  /**
   * The type of token being generated.
   */
  type: 'access' | 'refresh';

  /**
   * The JWT ID for unique token identification and revocation.
   */
  jti: string;

  /**
   * Optional user role for authorization purposes.
   */
  role?: string;
}

/**
 * Interface defining the structure of a token pair.
 */
export interface ITokenPair {
  /**
   * The access token used for authentication.
   */
  accessToken: string;

  /**
   * The refresh token used to obtain a new access token.
   */
  refreshToken: string;
}

/**
 * Interface for a token generator service.
 * Defines methods for generating token pairs with unique JTI claims.
 */
export interface ITokenGenerator {
  /**
   * Generates a pair of access and refresh tokens for a given user.
   * Each token includes a unique JWT ID (jti) for identification and revocation capabilities.
   * @param userId - The unique identifier of the user.
   * @returns An object containing the access token and refresh token with unique JTI claims.
   */
  generateTokenPair(userId: string): ITokenPair;
}
