import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IUser } from '../interfaces/entities/user.interface';

@Injectable()
export class UserAuthenticationRepository {
  constructor(
    private readonly loggerService: LoggerService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userData: Partial<User>): Promise<IUser> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
