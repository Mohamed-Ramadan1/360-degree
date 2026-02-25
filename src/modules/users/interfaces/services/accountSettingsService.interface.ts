import { IUser } from '../index';

/**
 * Service interface for managing user account settings and preferences.
 * Provides methods for terms acceptance, notification management, and phone verification.
 */
export interface IAccountSettingsService {
  /**
   * Records the user's acceptance of terms and conditions.
   *
   * @param user - The user accepting the terms
   * @returns A promise that resolves when the terms acceptance is recorded
   * @throws May throw an error if the operation fails or user is invalid
   */
  acceptTerms(user: IUser): Promise<void>;

  /**
   * Enables push/email notifications for the user's account.
   *
   * @param user - The user enabling notifications
   * @returns A promise that resolves when notifications are successfully enabled
   * @throws May throw an error if the operation fails or user is invalid
   */
  enableNotifications(user: IUser): Promise<void>;

  /**
   * Disables push/email notifications for the user's account.
   *
   * @param user - The user disabling notifications
   * @returns A promise that resolves when notifications are successfully disabled
   * @throws May throw an error if the operation fails or user is invalid
   */
  disableNotifications(user: IUser): Promise<void>;

  /**
   * Initiates the phone number verification process by sending an OTP code.
   *
   * @param user - The user requesting phone verification
   * @returns A promise that resolves when the verification code is sent
   * @throws May throw an error if phone number is missing or SMS delivery fails
   */
  requestPhoneNumberVerification(user: IUser): Promise<void>;

  /**
   * Verifies a user's phone number using the provided OTP code.
   *
   * @param userId - The unique identifier of the user
   * @param otpCode - The one-time password code sent to the user's phone
   * @returns A promise that resolves when the phone number is successfully verified
   * @throws May throw an error if the OTP is invalid, expired, or user is not found
   */
  verifyPhoneNumber(userId: string, otpCode: string): Promise<void>;
}
