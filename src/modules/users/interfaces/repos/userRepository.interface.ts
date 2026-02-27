import { Repository } from 'typeorm';

import { IUser } from '../entities/user.interface';

import { UpdateProfileData } from '../services/profileManagementService.interface';

/**
 * Interface defining the contract for user repository operations.
 */
export interface IUserRepository {
  /**
   * Gets the underlying TypeORM repository for the User entity.
   * @returns The TypeORM repository instance.
   */
  repository: Repository<IUser>;

  /**
   * Finds a user by their email address.
   * @param email - The email address of the user to find.
   * @returns A promise resolving to the User entity or null if not found.
   */
  findById(userId: string): Promise<IUser | null>;

  getUserById(userId: string): Promise<IUser>;

  getUserPassword(userId: string): Promise<string>;

  updateUserProfile(
    userId: string,
    updateProfileData: UpdateProfileData,
  ): Promise<void>;
}
