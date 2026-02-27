import { UpdateResult } from 'typeorm';

export interface IUserAccountStatusRepository {
  markAccountAsActive(userId: string): Promise<UpdateResult>;
  markAccountAsInactive(userId: string): Promise<UpdateResult>;
}
