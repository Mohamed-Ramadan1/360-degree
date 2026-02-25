import { UserRoles } from 'src/common/consts';

export interface IUser {
  id: string;
  name: string;
  isActive: boolean;
  email: string;
  password: string;
  passwordLastChangedAt: Date;
  isVerified: boolean;
  verifiedAt: Date;
  lastLoginAt: Date | null;
  roles: UserRoles[];
  phoneNumber: string;
  phoneNumberVerified: boolean;
  phoneNumberVerifiedAt: Date | null;
  accountToBeDeleted: boolean;
  toBeDeletedAt: Date | null;
  isDisabled: boolean;
  profileImage: string;
  profileImageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}
