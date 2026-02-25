/**
 * @interface IVerificationTokensCreatorService
 * @description Interface defining the structure for the VerificationTokensCreatorService.
 */
export interface IVerificationTokensCreatorService {
  createVerificationToken(key: string, ttl: number): Promise<string>;
}
