import { UserRoles } from 'src/common/consts';
import { IUser } from '../index';
import { User } from 'src/modules/users/entities/user.entity';

/**
 * Interface defining the contract for user authentication repository operations.
 * Handles user creation, role assignment, and authentication-related data updates.
 */
export interface IUserAuthenticationRepository {
  /**
   * Creates a new user with the provided data.
   *
   * @param userData - Partial user data containing the fields needed to create a user.
   *                   Can include email, name, password, and other User entity properties.
   * @returns A promise that resolves to the created user entity implementing IUser interface.
   *
   * @example
   * ```typescript
   * const user = await repository.createUser({
   *   email: 'user@example.com',
   *   name: 'John Doe',
   *   password: 'hashedPassword123'
   * });
   * ```
   */
  createUser(userData: Partial<IUser>): Promise<IUser>;

  /**
   * Creates a new user with specified roles assigned at creation time.
   * If no roles are provided, defaults to assigning the USER role.
   *
   * @param userData - Object containing required user information and optional roles.
   * @param userData.email - The user's email address (must be unique).
   * @param userData.name - The user's display name.
   * @param userData.password - The user's password (should be hashed before passing).
   * @param userData.roles - Optional array of roles to assign. Defaults to [UserRoles.USER] if not provided.
   * @returns A promise that resolves to the created User entity with assigned roles.
   *
   * @example
   * ```typescript
   * // Create user with default USER role
   * const user = await repository.createUserWithRoles({
   *   email: 'user@example.com',
   *   name: 'John Doe',
   *   password: 'hashedPassword123'
   * });
   *
   * // Create user with specific roles
   * const admin = await repository.createUserWithRoles({
   *   email: 'admin@example.com',
   *   name: 'Admin User',
   *   password: 'hashedPassword123',
   *   roles: [UserRoles.ADMIN, UserRoles.USER]
   * });
   * ```
   */
  createUserWithRoles(userData: {
    email: string;
    name: string;
    password: string;
    roles?: UserRoles[];
  }): Promise<IUser>;

  /**
   * Updates the last login timestamp for a user identified by their ID.
   * This method fails silently - errors and warnings are logged but not thrown.
   *
   * @param userId - The unique identifier of the user whose login time should be updated.
   * @returns A promise that resolves when the update completes (or fails silently).
   *
   * @remarks
   * - If the user ID doesn't exist (affected rows = 0), a warning is logged.
   * - If an error occurs during update, it's logged but not propagated.
   * - This method is typically called after successful authentication.
   *
   * @example
   * ```typescript
   * // Update last login after successful authentication
   * await repository.updateUserLastLogin('user-uuid-123');
   * ```
   */
  updateUserLastLogin(userId: string): Promise<void>;

  /**   * Finds and returns a user by their email address.
   *
   * @param email - The email address of the user to find.
   * @returns A promise resolving to the User entity.
   *
   * @throws NotFoundException if no user is found with the provided email.
   *
   * @example
   * ```typescript
   * const user = await repository.findByEmail('user@example.com');
   * ```
   */
  findByEmail(email: string): Promise<User>;

  /**
   * Verifies a user's email by updating their verification status and clearing token fields.
   * @param userId - The ID of the user.
   * @returns A promise that resolves when the update is complete.
   */
  verifyUserEmail(userId: string): Promise<void>;

  /**
   * Updates a user's password and clears their password reset token fields.
   * @param userId - The ID of the user.
   * @param newPassword - The new hashed password to set.
   * @returns A promise that resolves when the update is complete.
   */
  updateUserPassword(userId: string, newPassword: string): Promise<void>;

  /**
   * Finds and returns a user by their unique identifier.
   *
   * @param userId - The unique identifier (UUID) of the user to find.
   * @returns A promise resolving to the User entity implementing IUser interface.
   *
   * @throws NotFoundException if no user is found with the provided ID.
   *
   * @example
   * ```typescript
   * const user = await repository.findById('550e8400-e29b-41d4-a716-446655440000');
   * ```
   */
  findById(userId: string): Promise<IUser>;
}
