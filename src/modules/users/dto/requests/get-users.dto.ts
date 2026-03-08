import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  Length,
  MaxLength,
} from 'class-validator';
import { IsString } from 'class-validator';
import { UserRoles } from 'src/common/consts/roles';
import { PaginationDto } from 'src/common/pagination/dto';
import { Transform } from 'class-transformer';

export class GetUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({ description: 'Search by email' })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: UserRoles })
  @IsOptional()
  @IsEnum(UserRoles)
  role?: UserRoles;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by verified status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Filter by disabled status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isDisabled?: boolean;
}
