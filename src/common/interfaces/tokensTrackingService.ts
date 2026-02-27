/**
 * Service interface for managing and tracking refresh tokens in Redis.
 *
 * This service provides functionality for:
 * - Whitelisting refresh tokens with automatic expiration
 * - Tracking multiple tokens per user (multi-session support)
 * - Token validation and revocation
 * - User session management
 *
 * @remarks
 * All tokens are stored with a 7-day TTL (Time To Live) by default.
 * The service uses Redis sets to efficiently manage multiple tokens per user.
 */
export interface ITokensTrackingService {
  /**
   * Tracks a refresh token by storing it in Redis with associated user information.
   *
   * This method performs two operations:
   * 1. Stores the token with metadata (userId, createdAt) using key `refresh_token:{token}`
   * 2. Adds the token to the user's token set using key `user_tokens:{userId}`
   *
   * Both entries are set to expire after 7 days.
   *
   * @param token - The refresh token string to track
   * @param userId - The ID of the user who owns this token
   * @returns A promise that resolves when the token is successfully tracked
   * @throws Error if Redis operations fail
   *
   * @example
   * ```typescript
   * await tokensTrackingService.trackRefreshToken(
   *   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   *   'user-123'
   * );
   * ```
   */
  trackRefreshToken(token: string, userId: string): Promise<void>;

  /**
   * Checks if a refresh token exists in the whitelist (is currently valid).
   *
   * This is a fast lookup operation that checks if the token key exists in Redis.
   * Returns false if the token has expired or was never tracked.
   *
   * @param token - The refresh token to validate
   * @returns A promise that resolves to true if the token is whitelisted, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = await tokensTrackingService.isTokenWhitelisted(token);
   * if (isValid) {
   *   // Proceed with token refresh
   * }
   * ```
   */
  isTokenWhitelisted(token: string): Promise<boolean>;

  /**
   * Retrieves all valid (non-expired) refresh tokens for a specific user.
   *
   * This method:
   * 1. Fetches all tokens from the user's token set
   * 2. Validates each token still exists (hasn't expired)
   * 3. Removes expired tokens from the set during validation
   * 4. Returns only valid tokens
   *
   * @param userId - The ID of the user whose tokens to retrieve
   * @returns A promise that resolves to an array of valid token strings
   *
   * @example
   * ```typescript
   * const activeTokens = await tokensTrackingService.getAllUserTokens('user-123');
   * console.log(`User has ${activeTokens.length} active sessions`);
   * ```
   */
  getAllUserTokens(userId: string): Promise<string[]>;

  /**
   * Revokes (invalidates) a specific refresh token for a user.
   *
   * This method removes the token from both:
   * - The individual token storage (refresh_token:{token})
   * - The user's token set (user_tokens:{userId})
   *
   * After revocation, the token will fail validation checks.
   *
   * @param token - The refresh token to revoke
   * @param userId - The ID of the user who owns the token
   * @returns A promise that resolves when the token is revoked
   * @throws Error if Redis operations fail
   *
   * @example
   * ```typescript
   * // Logout from a specific device/session
   * await tokensTrackingService.revokeRefreshToken(token, userId);
   * ```
   */
  revokeRefreshToken(token: string, userId: string): Promise<void>;

  /**
   * Revokes all refresh tokens for a specific user across all sessions/devices.
   *
   * This is useful for:
   * - Global logout (logout from all devices)
   * - Security incidents (force re-authentication everywhere)
   * - Account compromise response
   *
   * Uses Redis pipeline for efficient batch deletion of all tokens.
   *
   * @param userId - The ID of the user whose tokens should be revoked
   * @returns A promise that resolves when all tokens are revoked
   * @throws Error if Redis operations fail
   *
   * @example
   * ```typescript
   * // Force user to re-login on all devices
   * await tokensTrackingService.revokeAllUserTokens('user-123');
   * ```
   */
  revokeAllUserTokens(userId: string): Promise<void>;

  /**
   * Gets the count of active sessions (valid tokens) for a user.
   *
   * This is a convenience method that returns the number of valid tokens
   * a user currently has. Each token typically represents one active session/device.
   *
   * @param userId - The ID of the user to count sessions for
   * @returns A promise that resolves to the number of active sessions
   *
   * @example
   * ```typescript
   * const sessionCount = await tokensTrackingService.getUserActiveSessionCount('user-123');
   * if (sessionCount > 5) {
   *   // Warn user about too many active sessions
   * }
   * ```
   */
  getUserActiveSessionCount(userId: string): Promise<number>;
}
