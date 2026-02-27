export interface IUserSettingsRepository {
  verifyPhoneNumber(userId: string): Promise<boolean>;
  acceptTerms(userId: string): Promise<void>;
  enableNotifications(userId: string): Promise<void>;
  disableNotifications(userId: string): Promise<void>;
}
