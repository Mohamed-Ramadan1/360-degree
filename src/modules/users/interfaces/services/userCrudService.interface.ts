import { AdminCreateUserDto } from 'src/modules/users/dto';
import { IUser } from '../entities/user.interface';

export interface IUserCrudService {
  createUser(userDto: AdminCreateUserDto): Promise<IUser>;

  //   updateUser(): Promise<void>;
  getUser(userId: string): Promise<IUser>;
  listUsers(): Promise<IUser[]>;
}

export type DeletionRequestData = {
  userId: string;
  reason: string;
  requestedBy: 'user' | 'admin';
  adminId?: string;
  scheduledAt: Date;
};
