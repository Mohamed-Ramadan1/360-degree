import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
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
    description: 'User password',
    example: 'P@ssw0rd123!',
    required: true,
  })
  password: string;
}
