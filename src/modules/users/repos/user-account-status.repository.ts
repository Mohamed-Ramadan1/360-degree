// nestjs imports
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// external package imports
import { Repository, UpdateResult } from 'typeorm';

// entity imports
import { User } from '../entities/user.entity';

@Injectable()
export class UserAccountStatusRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async markAccountAsActive(userId: string): Promise<UpdateResult> {
    return this.userRepository.update(userId, { isActive: true });
  }
}
