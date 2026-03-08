import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUser } from '../interfaces/entities/user.interface';
import { UpdateProfileData } from '../interfaces/services/profileManagementService.interface';
import { IUserRepository } from '../interfaces';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { GetUsersDto } from '../dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paginationService: PaginationService,
  ) {}

  get repository(): Repository<User> {
    return this.userRepository;
  }

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

  async findAll(dto: GetUsersDto) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.isActive',
        'users.isVerified',
        'users.isDisabled',
        'users.roles',
        'users.phoneNumber',
        'users.lastLoginAt',
        'users.createdAt',
      ]);

    return this.paginationService.paginate(queryBuilder, dto, {
      alias: 'users',
      filters: {
        name: { value: dto.name, operator: 'like' },
        email: { value: dto.email, operator: 'like' },
        roles: { value: dto.role, operator: 'any' },
        isActive: { value: dto.isActive },
        isVerified: { value: dto.isVerified },
        isDisabled: { value: dto.isDisabled },
      },
    });
  }

  async updateUserProfileImage(
    userId: string,
    imageInfo: { imageUrl: string; imageLocation: string },
  ): Promise<void> {
    await this.userRepository.update(userId, {
      profileImageKey: imageInfo.imageLocation,
      profileImage: imageInfo.imageUrl,
    });
  }

  async getUserPassword(userId: string): Promise<string> {
    const user: IUser | null = await this.userRepository.findOne({
      where: { id: userId },
      select: ['password'],
    });
    if (!user) throw new NotFoundException('No user match provided id');
    return user.password;
  }

  async updateUserProfile(
    userId: string,
    updateProfileData: UpdateProfileData,
  ): Promise<void> {
    const result = await this.userRepository.update(userId, {
      ...updateProfileData,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }
}
