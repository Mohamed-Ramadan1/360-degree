import { UserRoles } from 'src/common/consts/roles';

/**
 * Interface for Roles Management Service operations.
 * Defines the contract for managing user roles with email notifications and logging support.
 *
 * @interface IRolesManagementService
 */
export interface IRolesManagementService {
  /**
   * Assigns roles to a user and sends a notification email.
   * Only sends email if new roles were actually added.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {UserRoles[]} roles - Array of roles to assign to the user
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the user is not found
   * @throws {Error} If role assignment fails or email queueing fails
   *
   * @example
   * await assignRoles('user-123', [UserRoles.ADMIN, UserRoles.MODERATOR]);
   * // User receives email notification about new roles
   */
  assignRoles(userId: string, roles: UserRoles[]): Promise<void>;

  /**
   * Removes roles from a user and sends a notification email.
   * Throws BadRequestException if no roles were actually removed.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {UserRoles[]} roles - Array of roles to remove from the user
   * @returns {Promise<void>}
   * @throws {BadRequestException} If no roles were removed (user doesn't have the roles or attempting to remove USER role)
   * @throws {NotFoundException} If the user is not found
   * @throws {Error} If role removal fails or email queueing fails
   *
   * @example
   * await removeRoles('user-123', [UserRoles.ADMIN]);
   * // User receives email notification about removed roles
   */
  removeRoles(userId: string, roles: UserRoles[]): Promise<void>;

  /**
   * Resets a user's roles to the default USER role.
   * Removes all existing roles and assigns only the base USER role.
   *
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the user is not found
   * @throws {Error} If role reset operation fails
   *
   * @example
   * await resetRoles('user-123');
   * // User now has only [UserRoles.USER]
   */
  resetRoles(userId: string): Promise<void>;

  /**
   * Assigns roles to multiple users in a single operation.
   * Logs the operation results and returns detailed statistics.
   *
   * @param {string[]} userIds - Array of user identifiers
   * @param {UserRoles[]} roles - Array of roles to assign to all specified users
   * @returns {Promise<BulkAssignRolesResult>}
   *          Object containing operation status, counts, and detailed user IDs
   * @throws {NotFoundException} If any user is not found
   * @throws {Error} If bulk assignment operation fails
   *
   * @example
   * const result = await bulkAssignRoles(
   *   ['user-1', 'user-2', 'user-3'],
   *   [UserRoles.PREMIUM, UserRoles.VERIFIED]
   * );
   * console.log(`Updated: ${result.updated}, Skipped: ${result.skipped}`);
   * console.log('Updated user IDs:', result.details.updatedUserIds);
   */
  bulkAssignRoles(
    userIds: string[],
    roles: UserRoles[],
  ): Promise<BulkAssignRolesResult>;

  /**
   * Removes roles from multiple users in a single operation.
   * Logs the operation results and returns detailed statistics.
   *
   * @param {string[]} userIds - Array of user identifiers
   * @param {UserRoles[]} roles - Array of roles to remove from all specified users
   * @returns {Promise<BulkRemoveRolesResult>}
   *          Object containing operation status, number of updated users, and IDs of users not found
   * @throws {NotFoundException} If any user is not found
   * @throws {Error} If bulk removal operation fails
   *
   * @example
   * const result = await bulkRemoveRoles(
   *   ['user-1', 'user-2'],
   *   [UserRoles.PREMIUM]
   * );
   * console.log(`Successfully updated ${result.updated} users`);
   * if (result.notFound.length > 0) {
   *   console.log('Users not found:', result.notFound);
   * }
   */
  bulkRemoveRoles(
    userIds: string[],
    roles: UserRoles[],
  ): Promise<BulkRemoveRolesResult>;

  /**
   * Retrieves all roles assigned to a specific user.
   *
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<UserRoles[]>} Array of roles assigned to the user
   * @throws {NotFoundException} If the user is not found
   * @throws {Error} If role retrieval fails
   *
   * @example
   * const roles = await getUserRoles('user-123');
   * console.log(roles); // [UserRoles.USER, UserRoles.ADMIN]
   *
   * // Check if user has specific role
   * const isAdmin = roles.includes(UserRoles.ADMIN);
   */
  getUserRoles(userId: string): Promise<UserRoles[]>;
}

/**
 * Type definition for the result of bulk role assignment operations.
 *
 * @typedef {Object} BulkAssignRolesResult
 * @property {boolean} success - Indicates whether the operation completed successfully
 * @property {number} updated - Number of users that were updated with new roles
 * @property {number} skipped - Number of users that were skipped (already had all roles)
 * @property {Object} details - Detailed information about the operation
 * @property {string[]} details.updatedUserIds - Array of IDs for users that were updated
 * @property {string[]} details.skippedUserIds - Array of IDs for users that were skipped
 */
export type BulkAssignRolesResult = {
  success: boolean;
  updated: number;
  skipped: number;
  details: {
    updatedUserIds: string[];
    skippedUserIds: string[];
  };
};

/**
 * Type definition for the result of bulk role removal operations.
 *
 * @typedef {Object} BulkRemoveRolesResult
 * @property {boolean} success - Indicates whether the operation completed successfully
 * @property {number} updated - Number of users that were updated (had roles removed)
 * @property {string[]} notFound - Array of user IDs that were not found in the database
 */
export type BulkRemoveRolesResult = {
  success: boolean;
  updated: number;
  notFound: string[];
};
