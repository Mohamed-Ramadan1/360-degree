export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  lastLoginAt: Date | null;
  accountToBeDeleted: boolean;
  toBeDeletedAt: Date | null;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
