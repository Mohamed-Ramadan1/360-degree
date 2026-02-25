import { UserRoles } from 'src/common/consts';
import { IUser } from '../index';

/**
 * Interface for User Roles Repository operations.
 * Defines the contract for managing user roles including assignment, removal, and querying.
 *
 * @interface IUserRolesRepository
 */
export interface IUserRolesRepository {
  /**
   * Assigns one or more roles to a user.
   * Only adds roles that the user doesn't already have.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {UserRoles[]} roles - Array of roles to assign to the user
   * @returns {Promise<{user: IUser; addedRoles: UserRoles[]; isModified: boolean}>}
   *          Object containing the updated user, newly added roles, and modification status
   * @throws {NotFoundException} If the user is not found
   *
   * @example
   * const result = await assignRoles('user-123', [UserRoles.ADMIN, UserRoles.MODERATOR]);
   * console.log(result.addedRoles); // [UserRoles.ADMIN] (if MODERATOR already existed)
   * console.log(result.isModified); // true
   */
  assignRoles(
    userId: string,
    roles: UserRoles[],
  ): Promise<{ user: IUser; addedRoles: UserRoles[]; isModified: boolean }>;

  /**
   * Removes one or more roles from a user.
   * Only removes roles that the user currently has.
   *
   * @param {string} userId - The unique identifier of the user
   * @param {UserRoles[]} roles - Array of roles to remove from the user
   * @returns {Promise<{user: IUser; remainRoles: UserRoles[]; isModified: boolean}>}
   *          Object containing the updated user, remaining roles, and modification status
   * @throws {NotFoundException} If the user is not found
   *
   * @example
   * const result = await removeRoles('user-123', [UserRoles.ADMIN]);
   * console.log(result.remainRoles); // [UserRoles.USER, UserRoles.MODERATOR]
   * console.log(result.isModified); // true
   */
  removeRoles(
    userId: string,
    roles: UserRoles[],
  ): Promise<{
    user: IUser;
    remainRoles: UserRoles[];
    isModified: boolean;
  }>;

  /**
   * Assigns roles to multiple users in a single transaction.
   * Validates that all users exist before performing any updates.
   * Only updates users who don't already have all the specified roles.
   *
   * @param {string[]} userIds - Array of user identifiers
   * @param {UserRoles[]} rolesToAdd - Array of roles to assign to all specified users
   * @returns {Promise<{success: boolean; updated: number; skipped: number; details: {updatedUserIds: string[]; skippedUserIds: string[]}}>}
   *          Object containing operation status, counts, and detailed user IDs
   * @throws {NotFoundException} If any user is not found
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
    rolesToAdd: UserRoles[],
  ): Promise<{
    success: boolean;
    updated: number;
    skipped: number;
    details: {
      updatedUserIds: string[];
      skippedUserIds: string[];
    };
  }>;

  /**
   * Removes roles from multiple users in a single transaction.
   * Validates that all users exist before performing any updates.
   * Only updates users who currently have at least one of the specified roles.
   *
   * @param {string[]} userIds - Array of user identifiers
   * @param {UserRoles[]} rolesToRemove - Array of roles to remove from all specified users
   * @returns {Promise<{success: boolean; updated: number; notFound: string[]}>}
   *          Object containing operation status, number of updated users, and IDs of users not found
   * @throws {NotFoundException} If any user is not found
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
    rolesToRemove: UserRoles[],
  ): Promise<{ success: boolean; updated: number; notFound: string[] }>;

  /**
   * Retrieves all roles assigned to a specific user.
   *
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<UserRoles[]>} Array of roles assigned to the user
   * @throws {NotFoundException} If the user is not found
   *
   * @example
   * const roles = await getUserRoles('user-123');
   * console.log(roles); // [UserRoles.USER, UserRoles.ADMIN]
   *
   * // Check if user has specific role
   * const isAdmin = roles.includes(UserRoles.ADMIN);
   */
  getUserRoles(userId: string): Promise<UserRoles[]>;

  /**
   * Resets a user's roles to the default USER role.
   * Removes all existing roles and assigns only the base USER role.
   *
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the user is not found
   *
   * @example
   * await resetRoles('user-123');
   * // User now has only [UserRoles.USER]
   *
   * // Verify the reset
   * const roles = await getUserRoles('user-123');
   * console.log(roles); // [UserRoles.USER]
   */
  resetRoles(userId: string): Promise<void>;
}

/**
 * Type definition for the result of assigning roles to a user.
 *
 * @typedef {Object} AssignRolesResult
 * @property {IUser} user - The updated user entity
 * @property {UserRoles[]} addedRoles - Array of roles that were newly added
 * @property {boolean} isModified - Indicates whether the user's roles were modified
 */
export type AssignRolesResult = {
  user: IUser;
  addedRoles: UserRoles[];
  isModified: boolean;
};

/**
 * Type definition for the result of removing roles from a user.
 *
 * @typedef {Object} RemoveRolesResult
 * @property {IUser} user - The updated user entity
 * @property {UserRoles[]} remainRoles - Array of roles that remain after removal
 * @property {boolean} isModified - Indicates whether the user's roles were modified
 */
export type RemoveRolesResult = {
  user: IUser;
  remainRoles: UserRoles[];
  isModified: boolean;
};

/**
 * Type definition for the result of bulk role assignment operations.
 *
 * @typedef {Object} BulkAssignRolesResult
 * @property {boolean} success - Indicates whether the operation completed successfully
 * @property {number} updated - Number of users that were updated
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
 * @property {number} updated - Number of users that were updated
 * @property {string[]} notFound - Array of user IDs that were not found in the database
 */
export type BulkRemoveRolesResult = {
  success: boolean;
  updated: number;
  notFound: string[];
};
