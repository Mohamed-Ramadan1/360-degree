/**
 * Interface defining the contract for account recovery operations.
 */
export interface IAccountRecoveryService {
  /**
   * Sends a password reset email to the specified email address if a user exists.
   *
   * @param email - The email address of the user requesting a password reset.
   * @returns A promise that resolves when the email is queued or if no user is found.
   * @throws Error if an error occurs during the process.
   */
  sendPasswordResetEmail(email: string): Promise<void>;

  /**
   * Resets a user's password using a valid reset token and sends a confirmation email.
   *
   * @param token - The password reset token.
   * @param newPassword - The new password to set for the user.
   * @returns A promise that resolves when the password is updated and the confirmation email is queued.
   * @throws NotFoundException if no user is found with the provided token.
   * @throws Error if an error occurs during the process.
   */
  resetPassword(
    token: string,
    newPassword: string,
    userId: string,
  ): Promise<void>;

  /**
   * Verifies a user's email address using a verification token and sends a confirmation email.
   *
   * @param token - The email verification token.
   * @returns A promise that resolves when the email is verified and the confirmation email is queued.
   * @throws NotFoundException if no user is found with the provided token.
   * @throws BadRequestException if the token has expired.
   * @throws Error if an error occurs during the process.
   */
  verifyEmail(token: string, userId: string): Promise<void>;
}
