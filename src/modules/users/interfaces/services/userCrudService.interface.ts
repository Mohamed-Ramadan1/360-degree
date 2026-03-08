import { AdminCreateUserDto, GetUsersDto } from 'src/modules/users/dto';
import { IUser } from '../entities/user.interface';

export interface IUserCrudService {
  createUser(userDto: AdminCreateUserDto): Promise<IUser>;

  //   updateUser(): Promise<void>;
  getUser(userId: string): Promise<IUser>;
  listUsers(getUsersDto: GetUsersDto);
}

export type DeletionRequestData = {
  userId: string;
  reason: string;
  requestedBy: 'user' | 'admin';
  adminId?: string;
  scheduledAt: Date;
};
