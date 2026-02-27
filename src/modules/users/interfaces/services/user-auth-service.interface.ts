import { IUser } from '../index';

/**
 * Interface defining the contract for user authentication service operations.
 *
 * @remarks
 * This interface establishes the business logic layer contract for authentication-related
 * operations. It provides methods for user registration, login tracking, email verification,
 * user retrieval, and password management. All implementations should include comprehensive
 * error handling and logging.
 *
 * This interface ensures consistency across different implementations and facilitates
 * dependency injection and testing by allowing mock implementations.
 *
 * @example
 * ```typescript
 * // Using the interface for dependency injection
 * class AuthController {
 *   constructor(
 *     private readonly userAuthService: IUserAuthService
 *   ) {}
 * }
 *
 * // Mock implementation for testing
 * class MockUserAuthService implements IUserAuthService {
 *   async registerUser(userData) {
 *     return { id: 'mock-id', ...userData } as IUser;
 *   }
 *   // ... other methods
 * }
 * ```
 *
 * @see IUser
 * @see UserAuthService
 */
export interface IUserAuthService {
  /**
   * Registers a new user in the system.
   *
   * @remarks
   * This method creates a new user with the provided credentials and personal information.
   * The password should be hashed before being passed to this method. The implementation
   * should validate that the user was successfully created and throw appropriate exceptions
   * if the registration fails.
   *
   * All errors should be logged before being propagated to the caller to ensure proper
   * audit trails and debugging capabilities.
   *
   * @param userData - Object containing the user's registration information.
   * @param userData.email - The user's email address. Must be unique in the system.
   * @param userData.password - The user's hashed password.
   * @param userData.name - The user's display name.
   *
   * @returns A promise that resolves to the created user entity implementing IUser interface.
   *
   * @throws {BadRequestException} If the user creation fails or returns null/undefined.
   * @throws {ConflictException} If a user with the provided email already exists.
   * @throws {Error} If any other error occurs during the registration process.
   *
   * @example
   * ```typescript
   * // Register a new user
   * try {
   *   const hashedPassword = await bcrypt.hash(plainPassword, 10);
   *   const newUser = await userAuthService.registerUser({
   *     email: 'newuser@example.com',
   *     name: 'Jane Smith',
   *     password: hashedPassword
   *   });
   *   console.log('User registered with ID:', newUser.id);
   * } catch (error) {
   *   console.error('Registration failed:', error.message);
   * }
   * ```
   */
  registerUser(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<IUser>;

  /**
   * Updates the last login timestamp for a user.
   *
   * @remarks
   * This method is typically called after successful authentication to track when
   * users last accessed the system. Unlike other methods in this interface, implementations
   * should handle errors gracefully without throwing exceptions, ensuring that login
   * tracking failures don't disrupt the authentication flow.
   *
   * This is considered a non-critical operation - failures should be logged but should
   * not prevent users from accessing the system. The method should always resolve
   * successfully even if the underlying update fails.
   *
   * @param userId - The unique identifier (UUID) of the user whose login time should be updated.
   * @returns A promise that resolves when the update attempt completes.
   *          The promise should always resolve (never reject) even if the update fails.
   *
   * @example
   * ```typescript
   * // Update last login after successful authentication
   * const tokens = await this.generateTokens(user);
   * await this.userAuthService.updateLastLogin(user.id); // Non-blocking
   * return {
   *   accessToken: tokens.accessToken,
   *   refreshToken: tokens.refreshToken,
   *   user
   * };
   * ```
   */
  updateLastLogin(userId: string): Promise<void>;

  /**
   * Finds and returns a user by their email address.
   *
   * @remarks
   * This method is commonly used during login operations to retrieve user data for
   * authentication. The implementation should return complete user information including
   * the password hash (for credential verification), account status, and other relevant
   * authentication data.
   *
   * All errors should be logged before being propagated. Implementations should be
   * careful not to leak information about whether an email exists in the system through
   * different error messages or timing attacks.
   *
   * @param email - The email address of the user to find.
   * @returns A promise that resolves to the User entity implementing IUser interface.
   *
   * @throws {NotFoundException} If no user is found with the provided email address.
   * @throws {Error} If any other error occurs during the database query.
   *
   * @example
   * ```typescript
   * // Login flow
   * try {
   *   const user = await userAuthService.findByEmail(loginDto.email);
   *   const isPasswordValid = await bcrypt.compare(
   *     loginDto.password,
   *     user.password
   *   );
   *
   *   if (!isPasswordValid) {
   *     throw new UnauthorizedException('Invalid credentials');
   *   }
   *
   *   return await this.generateTokens(user);
   * } catch (error) {
   *   // Don't reveal whether email exists
   *   throw new UnauthorizedException('Invalid credentials');
   * }
   * ```
   */
  findByEmail(email: string): Promise<IUser>;

  /**
   * Verifies a user's email address by updating their verification status.
   *
   * @remarks
   * This method is typically called after a user clicks a verification link sent to
   * their email. The implementation should update the user's verification status to
   * true and record the timestamp when verification occurred. This operation should
   * be atomic at the database level.
   *
   * All errors should be logged with full context before being re-thrown, allowing
   * proper error handling and user feedback in the verification flow.
   *
   * @param userId - The unique identifier (UUID) of the user to verify.
   * @returns A promise that resolves when the verification is complete.
   *
   * @throws {NotFoundException} If no user is found with the provided ID.
   * @throws {Error} If any other error occurs during the update operation.
   *
   * @example
   * ```typescript
   * // Email verification endpoint
   * async verifyEmail(token: string) {
   *   try {
   *     const payload = await this.verifyEmailToken(token);
   *     await this.userAuthService.verifyUserEmail(payload.userId);
   *     return {
   *       message: 'Email verified successfully',
   *       verified: true
   *     };
   *   } catch (error) {
   *     if (error instanceof NotFoundException) {
   *       throw new BadRequestException('Invalid verification link');
   *     }
   *     if (error.name === 'TokenExpiredError') {
   *       throw new BadRequestException('Verification link has expired');
   *     }
   *     throw error;
   *   }
   * }
   * ```
   */
  verifyUserEmail(userId: string): Promise<void>;

  /**
   * Retrieves a user by their unique identifier.
   *
   * @remarks
   * This method is useful for fetching user details when you have the user ID, such as
   * from a JWT token payload, session data, or when resolving user references in other
   * entities. The implementation should return the complete user entity with all
   * associated data.
   *
   * All errors encountered during the lookup should be logged with full context before
   * being re-thrown to the caller for appropriate handling.
   *
   * @param userId - The unique identifier (UUID) of the user to retrieve.
   * @returns A promise that resolves to the User entity implementing IUser interface.
   *
   * @throws {NotFoundException} If no user is found with the provided ID.
   * @throws {Error} If any other error occurs during the database query.
   *
   * @example
   * ```typescript
   * // Get current user from JWT token
   * @Get('profile')
   * @UseGuards(JwtAuthGuard)
   * async getProfile(@CurrentUser() user: { id: string }) {
   *   try {
   *     const fullUser = await this.userAuthService.getUserById(user.id);
   *     return {
   *       id: fullUser.id,
   *       email: fullUser.email,
   *       name: fullUser.name,
   *       roles: fullUser.roles,
   *       isVerified: fullUser.isVerified
   *     };
   *   } catch (error) {
   *     if (error instanceof NotFoundException) {
   *       throw new UnauthorizedException('Session invalid');
   *     }
   *     throw error;
   *   }
   * }
   * ```
   */
  getUserById(userId: string): Promise<IUser>;

  /**
   * Updates a user's password with a new hashed password.
   *
   * @remarks
   * This method is used for password reset operations and password change functionality.
   * The implementation should update both the password field and the password change
   * timestamp atomically. The password must be pre-hashed before being passed to this
   * method using a secure hashing algorithm (e.g., bcrypt, argon2).
   *
   * Implementations should consider invalidating existing refresh tokens and sessions
   * after a password change for security purposes, though this is typically handled
   * in a higher-level service or orchestration layer.
   *
   * All errors should be logged with full context before being re-thrown.
   *
   * @param userId - The unique identifier (UUID) of the user whose password should be updated.
   * @param newPassword - The new password hash to set for the user. Must be pre-hashed.
   * @returns A promise that resolves when the password update is complete.
   *
   * @throws {NotFoundException} If no user is found with the provided ID.
   * @throws {Error} If any other error occurs during the update operation.
   *
   * @example
   * ```typescript
   * // Password reset flow
   * async resetPassword(token: string, newPassword: string) {
   *   try {
   *     // Verify reset token
   *     const payload = await this.verifyPasswordResetToken(token);
   *
   *     // Hash new password
   *     const hashedPassword = await bcrypt.hash(newPassword, 10);
   *
   *     // Update password
   *     await this.userAuthService.updateUserPassword(
   *       payload.userId,
   *       hashedPassword
   *     );
   *
   *     // Invalidate all existing sessions
   *     await this.tokenService.revokeAllUserTokens(payload.userId);
   *
   *     return {
   *       message: 'Password updated successfully',
   *       success: true
   *     };
   *   } catch (error) {
   *     if (error instanceof NotFoundException) {
   *       throw new BadRequestException('Invalid password reset link');
   *     }
   *     if (error.name === 'TokenExpiredError') {
   *       throw new BadRequestException('Password reset link has expired');
   *     }
   *     throw error;
   *   }
   * }
   * ```
   */
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
}
