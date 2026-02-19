import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserPasswordDto {
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @ApiProperty({
    example: 'currentPassword123',
    required: true,
    description: 'The current password of the user.',
  })
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @ApiProperty({
    example: 'newPassword123',
    required: true,
    description:
      'The new password for the user. Must be at least 8 characters long.',
  })
  newPassword: string;
}
