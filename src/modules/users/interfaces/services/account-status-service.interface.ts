import { IUser } from '../index';

export interface IAccountStatusService {
  activateAccount(user: IUser): Promise<void>;
  deactivateAccount(user: IUser): Promise<void>;
}
