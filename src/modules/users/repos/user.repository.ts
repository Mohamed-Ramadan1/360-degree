import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUser } from '../interfaces/entities/user.interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(userId: string): Promise<IUser | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async getUserById(userId: string): Promise<IUser> {
    const user: IUser | null = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'name',
        'isVerified',
        'isDisabled',
        'isDisabled',
        'roles',
        'createdAt',
        'updatedAt',
        'phoneNumber',
        'accountToBeDeleted',
      ],
    });

    if (!user) throw new NotFoundException('No user match provided id');
    return user;
  }

  async findAll(): Promise<IUser[]> {
    return await this.userRepository.find({
      select: ['id', 'email', 'name', 'isVerified', 'createdAt'],
    });
  }
}
