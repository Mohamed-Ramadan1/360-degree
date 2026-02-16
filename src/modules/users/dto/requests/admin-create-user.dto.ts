import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from 'src/common/consts';
export class AdminCreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
    {
      message:
        'Password must be 8-128 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @ApiProperty({
    description:
      'User password (8-128 characters, at least one uppercase letter, one lowercase letter, one number, and one special character)',
    example: 'P@ssw0rd!',
    required: true,
  })
  password: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({
    enum: UserRoles,
    isArray: true,
    example: [UserRoles.USER, UserRoles.ADMIN],
  })
  roles: UserRoles[];
}
