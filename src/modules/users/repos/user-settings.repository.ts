// nestjs imports
import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

// external package imports
import { Repository } from 'typeorm';

// entity imports
import { User } from '../entities/user.entity';

@Injectable()
export class UserSettingsRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async acceptTerms(userId: string): Promise<void> {
    const result = await this.userRepository.update(userId, {
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }
}
