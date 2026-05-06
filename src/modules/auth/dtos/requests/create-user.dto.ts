import {
  IsNotEmpty,
  IsString,
  IsTimeZone,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: true,
  })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
    required: true,
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
    {
      message:
        'Password must be 8-128 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @ApiProperty({
    description: 'The password of the user',
    example: 'strongPassword@123',
    required: true,
  })
  password!: string;

  @IsNotEmpty()
  @IsString()
  @IsTimeZone()
  @ApiProperty({
    description: 'The timezone of the user (e.g., "America/New_York")',
    example: 'America/New_York',
    required: true,
  })
  timezone!: string;
}
