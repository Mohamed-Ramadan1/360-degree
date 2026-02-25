/**
 * Interface for the PasswordHelperService, defining the contract for password hashing and comparison operations.
 * This service provides methods to securely hash passwords and verify plain passwords against hashed ones.
 */
export interface IPasswordHelperService {
  /**
   * Hashes a plain-text password using a secure hashing algorithm (e.g., bcrypt).
   *
   * @param password - The plain-text password to hash.
   * @returns A promise resolving to the hashed password as a string.
   * @throws {Error} If the hashing process fails (e.g., invalid input or internal bcrypt error).
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Compares a plain-text password against a hashed password to verify if they match.
   *
   * @param plainPassword - The plain-text password to verify.
   * @param hashedPassword - The hashed password to compare against.
   * @returns A promise resolving to a boolean indicating whether the plain password matches the hashed password.
   * @throws {Error} If the comparison process fails (e.g., invalid input or internal bcrypt error).
   */
  comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
